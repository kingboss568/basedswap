"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useBalance,
} from "wagmi";
import { parseUnits, formatUnits, maxUint256, encodeFunctionData, encodePacked, isAddress, getAddress } from "viem";
import {
  UNISWAP_V3,
  TOKENS,
  FEE_TIERS,
  HOP_FEE_TIERS,
  INTERMEDIATES,
  BASE_CHAIN_ID,
  ADDRESS_THIS,
  FEE_BIPS,
  FEE_RECIPIENT,
  CHAIN_META,
  EXPLORER_TX,
  SUPPORTED_CHAIN_IDS,
  isSupportedChain,
  loadCustomTokens,
  saveCustomToken,
  type Token,
} from "@/lib/contracts";
import { SWAP_ROUTER_ABI, QUOTER_V2_ABI, ERC20_ABI, WETH_ABI } from "@/lib/abis";
import { loadQuestData, recordSwap } from "@/lib/quests";

type Route =
  | { kind: "direct"; fee: number }
  | { kind: "hop"; mid: `0x${string}`; feeIn: number; feeOut: number };

type Quote = { amountOut: bigint; route: Route; impactPct: number | null };

const FEE_PCT_LABEL = (FEE_BIPS / 100).toFixed(2) + "%";

// Reserve a tiny amount of native token for gas when user clicks MAX.
// Same value across chains is fine — gas costs cents on L2s, native is the gas token.
const NATIVE_GAS_RESERVE = parseUnits("0.001", 18);

const QUOTE_REFRESH_MS = 20_000;

function formatBalance(value: bigint, decimals: number, places = 4): string {
  const formatted = formatUnits(value, decimals);
  const num = Number(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  return num.toLocaleString(undefined, { maximumFractionDigits: places });
}

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { switchChain, isPending: switching } = useSwitchChain();

  const supported = isSupportedChain(chainId);
  const effectiveChainId = supported ? chainId : BASE_CHAIN_ID;
  const v3 = UNISWAP_V3[effectiveChainId];
  const baseTokens = TOKENS[effectiveChainId] ?? TOKENS[BASE_CHAIN_ID];
  const meta = CHAIN_META[effectiveChainId];

  const [customTokens, setCustomTokens] = useState<Token[]>([]);
  const tokens = useMemo(() => [...baseTokens, ...customTokens], [baseTokens, customTokens]);

  const [tokenIn, setTokenIn] = useState<Token>(baseTokens[0]);
  const [tokenOut, setTokenOut] = useState<Token>(baseTokens[2] ?? baseTokens[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [deadlineMins, setDeadlineMins] = useState(20);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chainMenuOpen, setChainMenuOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [rateInverted, setRateInverted] = useState(false);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const quoteRequestId = useRef(0);

  useEffect(() => {
    const list = TOKENS[effectiveChainId] ?? TOKENS[BASE_CHAIN_ID];
    setTokenIn(list[0]);
    setTokenOut(list[2] ?? list[1]);
    setQuote(null);
    setAmountIn("");
    setCustomTokens(loadCustomTokens(effectiveChainId));
  }, [effectiveChainId]);

  // ---- Balance reads (wagmi handles native vs ERC20 via the `token` arg) ----
  const { data: balanceIn, refetch: refetchBalanceIn } = useBalance({
    address,
    token: tokenIn.isNative ? undefined : tokenIn.address,
    chainId: effectiveChainId,
    query: { enabled: !!address && supported },
  });

  const { data: balanceOut, refetch: refetchBalanceOut } = useBalance({
    address,
    token: tokenOut.isNative ? undefined : tokenOut.address,
    chainId: effectiveChainId,
    query: { enabled: !!address && supported },
  });

  const parsedAmountIn = useMemo(() => {
    if (!amountIn || isNaN(Number(amountIn))) return 0n;
    try {
      return parseUnits(amountIn, tokenIn.decimals);
    } catch {
      return 0n;
    }
  }, [amountIn, tokenIn.decimals]);

  const tokenInForQuote = tokenIn.isNative ? v3.weth : tokenIn.address;
  const tokenOutForQuote = tokenOut.isNative ? v3.weth : tokenOut.address;
  const sameUnderlying = tokenInForQuote.toLowerCase() === tokenOutForQuote.toLowerCase();

  // ETH↔WETH (and WBNB/WPOL/WAVAX equivalents) is a 1:1 wrap, not a swap.
  const wrapMode: "wrap" | "unwrap" | null = useMemo(() => {
    if (tokenIn.isNative && !tokenOut.isNative && sameUnderlying) return "wrap";
    if (!tokenIn.isNative && tokenOut.isNative && sameUnderlying) return "unwrap";
    return null;
  }, [tokenIn.isNative, tokenOut.isNative, sameUnderlying]);

  const quoteRoute = useCallback(
    async (route: Route, amount: bigint): Promise<bigint> => {
      if (!publicClient) throw new Error("no client");
      if (route.kind === "direct") {
        const result = await publicClient.simulateContract({
          address: v3.quoterV2,
          abi: QUOTER_V2_ABI,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn: tokenInForQuote,
              tokenOut: tokenOutForQuote,
              amountIn: amount,
              fee: route.fee,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });
        return result.result[0] as bigint;
      }
      const path = encodePacked(
        ["address", "uint24", "address", "uint24", "address"],
        [tokenInForQuote, route.feeIn, route.mid, route.feeOut, tokenOutForQuote]
      );
      const result = await publicClient.simulateContract({
        address: v3.quoterV2,
        abi: QUOTER_V2_ABI,
        functionName: "quoteExactInput",
        args: [path, amount],
      });
      return result.result[0] as bigint;
    },
    [publicClient, v3.quoterV2, tokenInForQuote, tokenOutForQuote]
  );

  const fetchQuote = useCallback(async () => {
    if (!publicClient || parsedAmountIn === 0n || !supported || wrapMode || sameUnderlying) {
      setQuote(null);
      return;
    }
    const requestId = ++quoteRequestId.current;
    setQuoting(true);

    // Candidate routes: every direct fee tier + 2-hop via each intermediate.
    const routes: Route[] = FEE_TIERS.map((fee) => ({ kind: "direct" as const, fee }));
    const mids = (INTERMEDIATES[effectiveChainId] ?? []).filter(
      (mid) =>
        mid.toLowerCase() !== tokenInForQuote.toLowerCase() &&
        mid.toLowerCase() !== tokenOutForQuote.toLowerCase()
    );
    for (const mid of mids) {
      for (const feeIn of HOP_FEE_TIERS) {
        for (const feeOut of HOP_FEE_TIERS) {
          routes.push({ kind: "hop", mid, feeIn, feeOut });
        }
      }
    }

    const results = await Promise.allSettled(routes.map((r) => quoteRoute(r, parsedAmountIn)));
    if (requestId !== quoteRequestId.current) return; // stale

    let best: { amountOut: bigint; route: Route } | null = null;
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.status === "fulfilled" && res.value > 0n) {
        if (!best || res.value > best.amountOut) best = { amountOut: res.value, route: routes[i] };
      }
    }

    if (!best) {
      setQuote(null);
      setQuoting(false);
      return;
    }

    // Price impact: compare execution rate against the rate for a 1/1000 probe.
    let impactPct: number | null = null;
    const probeIn = parsedAmountIn / 1000n;
    if (probeIn > 0n) {
      try {
        const probeOut = await quoteRoute(best.route, probeIn);
        if (probeOut > 0n) {
          const execRate = Number(best.amountOut) / Number(parsedAmountIn);
          const spotRate = Number(probeOut) / Number(probeIn);
          if (spotRate > 0) impactPct = Math.max(0, (1 - execRate / spotRate) * 100);
        }
      } catch {}
    }
    if (requestId !== quoteRequestId.current) return;

    setQuote({ amountOut: best.amountOut, route: best.route, impactPct });
    setQuoting(false);
  }, [
    publicClient,
    parsedAmountIn,
    supported,
    wrapMode,
    sameUnderlying,
    effectiveChainId,
    tokenInForQuote,
    tokenOutForQuote,
    quoteRoute,
  ]);

  useEffect(() => {
    const t = setTimeout(fetchQuote, 400);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  // Auto-refresh the quote so the displayed price never goes stale.
  useEffect(() => {
    const interval = setInterval(() => {
      if (parsedAmountIn > 0n && !pendingTx && document.visibilityState === "visible") {
        fetchQuote();
      }
    }, QUOTE_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchQuote, parsedAmountIn, pendingTx]);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn.isNative ? undefined : tokenIn.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, v3.swapRouter02] : undefined,
    chainId: effectiveChainId,
    query: { enabled: !!address && !tokenIn.isNative && supported },
  });

  const needsApproval =
    !tokenIn.isNative && !wrapMode && (allowance ?? 0n) < parsedAmountIn;
  const insufficientBalance = balanceIn ? parsedAmountIn > balanceIn.value : false;

  const { isLoading: txConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: pendingTx,
  });

  useEffect(() => {
    if (txSuccess && pendingTx && address) {
      const data = loadQuestData(address);
      recordSwap(address, data, {
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amountIn,
        txHash: pendingTx,
      });
      setStatusMsg(`Swap confirmed on ${meta?.name}! +5 points`);
      setAmountIn("");
      setQuote(null);
      // Refresh balances
      refetchBalanceIn();
      refetchBalanceOut();
      window.dispatchEvent(new Event("basedswap:quest-updated"));
      const timer = setTimeout(() => {
        setPendingTx(undefined);
        setStatusMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [txSuccess, pendingTx, address, tokenIn.symbol, tokenOut.symbol, amountIn, meta?.name, refetchBalanceIn, refetchBalanceOut]);

  const handleApprove = async () => {
    if (!address || tokenIn.isNative || !supported) return;
    try {
      setStatusMsg("Approving token...");
      const hash = await writeContractAsync({
        address: tokenIn.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [v3.swapRouter02, maxUint256],
      });
      setStatusMsg("Approval submitted, waiting...");
      await publicClient?.waitForTransactionReceipt({ hash });
      await refetchAllowance();
      setStatusMsg("Approved! You can now swap.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e: any) {
      setStatusMsg(e?.shortMessage || "Approval failed");
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleWrap = async () => {
    if (!address || !wrapMode || parsedAmountIn === 0n || !supported) return;
    try {
      setStatusMsg(wrapMode === "wrap" ? "Wrapping..." : "Unwrapping...");
      const hash =
        wrapMode === "wrap"
          ? await writeContractAsync({
              address: v3.weth,
              abi: WETH_ABI,
              functionName: "deposit",
              value: parsedAmountIn,
            })
          : await writeContractAsync({
              address: v3.weth,
              abi: WETH_ABI,
              functionName: "withdraw",
              args: [parsedAmountIn],
            });
      setPendingTx(hash);
      setStatusMsg("Transaction sent, waiting for confirmation...");
    } catch (e: any) {
      setStatusMsg(e?.shortMessage || "Transaction failed");
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleSwap = async () => {
    if (!address || !quote || parsedAmountIn === 0n || !supported) return;

    const amountOutMinimum =
      (quote.amountOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

    let swapCall: `0x${string}`;
    if (quote.route.kind === "direct") {
      swapCall = encodeFunctionData({
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: tokenInForQuote,
            tokenOut: tokenOutForQuote,
            fee: quote.route.fee,
            recipient: ADDRESS_THIS,
            amountIn: parsedAmountIn,
            amountOutMinimum,
            sqrtPriceLimitX96: 0n,
          },
        ],
      });
    } else {
      const path = encodePacked(
        ["address", "uint24", "address", "uint24", "address"],
        [tokenInForQuote, quote.route.feeIn, quote.route.mid, quote.route.feeOut, tokenOutForQuote]
      );
      swapCall = encodeFunctionData({
        abi: SWAP_ROUTER_ABI,
        functionName: "exactInput",
        args: [
          {
            path,
            recipient: ADDRESS_THIS,
            amountIn: parsedAmountIn,
            amountOutMinimum,
          },
        ],
      });
    }

    let deliverCall: `0x${string}`;
    if (tokenOut.isNative) {
      deliverCall = encodeFunctionData({
        abi: SWAP_ROUTER_ABI,
        functionName: "unwrapWETH9WithFee",
        args: [amountOutMinimum, address, BigInt(FEE_BIPS), FEE_RECIPIENT],
      });
    } else {
      deliverCall = encodeFunctionData({
        abi: SWAP_ROUTER_ABI,
        functionName: "sweepTokenWithFee",
        args: [tokenOut.address, amountOutMinimum, address, BigInt(FEE_BIPS), FEE_RECIPIENT],
      });
    }

    const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMins * 60);

    try {
      setStatusMsg("Sending swap transaction...");
      const hash = await writeContractAsync({
        address: v3.swapRouter02,
        abi: SWAP_ROUTER_ABI,
        functionName: "multicall",
        args: [deadline, [swapCall, deliverCall]],
        value: tokenIn.isNative ? parsedAmountIn : 0n,
      });
      setPendingTx(hash);
      setStatusMsg("Transaction sent, waiting for confirmation...");
    } catch (e: any) {
      setStatusMsg(e?.shortMessage || "Swap failed");
      setTimeout(() => setStatusMsg(""), 5000);
    }
  };

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    setQuote(null);
  };

  const handleMax = () => {
    if (!balanceIn) return;
    let max = balanceIn.value;
    if (tokenIn.isNative && max > NATIVE_GAS_RESERVE) {
      max = max - NATIVE_GAS_RESERVE;
    }
    setAmountIn(formatUnits(max, tokenIn.decimals));
  };

  const handlePercent = (pct: number) => {
    if (!balanceIn) return;
    let max = balanceIn.value;
    if (tokenIn.isNative && max > NATIVE_GAS_RESERVE) {
      max = max - NATIVE_GAS_RESERVE;
    }
    const v = (max * BigInt(pct)) / 100n;
    setAmountIn(formatUnits(v, tokenIn.decimals));
  };

  // Import an arbitrary ERC-20 by address: read its metadata on-chain.
  const handleImportToken = useCallback(
    async (rawAddress: string): Promise<Token | null> => {
      if (!publicClient || !isAddress(rawAddress)) return null;
      const addr = getAddress(rawAddress);
      try {
        const [symbol, name, decimals] = await Promise.all([
          publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: "symbol" }),
          publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: "name" }),
          publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: "decimals" }),
        ]);
        const token: Token = {
          symbol: String(symbol),
          name: String(name),
          address: addr,
          decimals: Number(decimals),
          imported: true,
        };
        setCustomTokens(saveCustomToken(effectiveChainId, token));
        return token;
      } catch {
        return null;
      }
    },
    [publicClient, effectiveChainId]
  );

  const grossOut = wrapMode ? parsedAmountIn : quote?.amountOut ?? 0n;
  const protocolFeeAmount = wrapMode ? 0n : (grossOut * BigInt(FEE_BIPS)) / 10000n;
  const netOut = grossOut - protocolFeeAmount;
  const formattedNetOut = grossOut > 0n ? formatUnits(netOut, tokenOut.decimals) : "";
  const formattedFee = grossOut > 0n ? formatUnits(protocolFeeAmount, tokenOut.decimals) : "";
  const amountMinimumV3 = quote
    ? (quote.amountOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n
    : 0n;
  const minOutAfterFee = amountMinimumV3 - (amountMinimumV3 * BigInt(FEE_BIPS)) / 10000n;

  // Display rate: 1 tokenIn = X tokenOut (invertible by clicking).
  const rateLabel = useMemo(() => {
    if (netOut === 0n || parsedAmountIn === 0n) return null;
    const inNum = Number(formatUnits(parsedAmountIn, tokenIn.decimals));
    const outNum = Number(formatUnits(netOut, tokenOut.decimals));
    if (inNum <= 0 || outNum <= 0) return null;
    if (rateInverted) {
      return `1 ${tokenOut.symbol} ≈ ${(inNum / outNum).toLocaleString(undefined, { maximumSignificantDigits: 6 })} ${tokenIn.symbol}`;
    }
    return `1 ${tokenIn.symbol} ≈ ${(outNum / inNum).toLocaleString(undefined, { maximumSignificantDigits: 6 })} ${tokenOut.symbol}`;
  }, [netOut, parsedAmountIn, tokenIn, tokenOut, rateInverted]);

  const routeLabel = useMemo(() => {
    if (!quote) return null;
    if (quote.route.kind === "direct") return "Direct";
    const mid = quote.route.mid.toLowerCase();
    const midToken = tokens.find((t) => t.address.toLowerCase() === mid);
    return `via ${midToken?.symbol ?? shortAddr(quote.route.mid)}`;
  }, [quote, tokens]);

  const highImpact = (quote?.impactPct ?? 0) > 5;

  let buttonLabel = "Enter an amount";
  let buttonDisabled = true;
  let buttonAction: () => void = () => {};
  if (!isConnected) {
    buttonLabel = "Connect Wallet to Swap";
  } else if (!supported) {
    buttonLabel = switching ? "Switching network..." : "Switch to Base";
    buttonDisabled = switching;
    buttonAction = () => switchChain({ chainId: BASE_CHAIN_ID });
  } else if (parsedAmountIn === 0n) {
    buttonLabel = "Enter an amount";
  } else if (sameUnderlying && !wrapMode) {
    buttonLabel = "Pick different tokens";
  } else if (insufficientBalance) {
    buttonLabel = `Insufficient ${tokenIn.symbol} balance`;
  } else if (wrapMode) {
    buttonLabel = txConfirming
      ? "Confirming on-chain..."
      : wrapMode === "wrap"
        ? `Wrap ${tokenIn.symbol} to ${tokenOut.symbol}`
        : `Unwrap ${tokenIn.symbol} to ${tokenOut.symbol}`;
    buttonDisabled = txConfirming;
    buttonAction = handleWrap;
  } else if (quoting && !quote) {
    buttonLabel = "Fetching best price...";
  } else if (!quote) {
    buttonLabel = "No route found for this pair";
  } else if (needsApproval) {
    buttonLabel = `Approve ${tokenIn.symbol}`;
    buttonDisabled = false;
    buttonAction = handleApprove;
  } else if (txConfirming) {
    buttonLabel = "Confirming on-chain...";
  } else {
    buttonLabel = highImpact
      ? `Swap anyway (high price impact)`
      : `Swap ${tokenIn.symbol} for ${tokenOut.symbol}`;
    buttonDisabled = false;
    buttonAction = handleSwap;
  }

  const explorerBase = EXPLORER_TX[effectiveChainId] ?? EXPLORER_TX[BASE_CHAIN_ID];

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-panel p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swap</h2>
        <div className="flex items-center gap-2">
          {/* Chain switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setChainMenuOpen(!chainMenuOpen);
                setSettingsOpen(false);
              }}
              className="flex items-center gap-1 rounded-full border border-border bg-panel2 px-2 py-1 text-[10px] uppercase tracking-wide text-muted hover:border-accent hover:text-white"
            >
              {meta?.name ?? "Network"}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {chainMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setChainMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-border bg-panel p-1 shadow-2xl">
                  {SUPPORTED_CHAIN_IDS.map((id) => (
                    <button
                      key={id}
                      onClick={() => {
                        setChainMenuOpen(false);
                        if (id !== chainId) switchChain({ chainId: id });
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-panel2 ${
                        id === effectiveChainId ? "text-accent" : ""
                      }`}
                    >
                      {CHAIN_META[id]?.name}
                      {id === effectiveChainId && <span>●</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <button
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setChainMenuOpen(false);
              }}
              className="rounded-full border border-border bg-panel2 px-2 py-1 text-[10px] text-muted hover:border-accent hover:text-white"
              aria-label="Settings"
            >
              {slippage}% ⚙
            </button>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-panel p-4 shadow-2xl">
                  <div className="text-xs font-medium">Slippage tolerance</div>
                  <div className="mt-2 flex items-center gap-2">
                    {[0.1, 0.5, 1].map((v) => (
                      <button
                        key={v}
                        onClick={() => setSlippage(v)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                          slippage === v
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted hover:border-accent"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                    <div className="flex flex-1 items-center rounded-lg border border-border px-2 py-1.5">
                      <input
                        type="number"
                        min="0.05"
                        max="50"
                        step="0.1"
                        value={slippage}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) setSlippage(Math.max(0.05, Math.min(50, v)));
                        }}
                        className="w-full bg-transparent text-right text-xs outline-none"
                      />
                      <span className="ml-1 text-xs text-muted">%</span>
                    </div>
                  </div>
                  {slippage > 5 && (
                    <p className="mt-2 text-[10px] text-yellow-400">
                      High slippage — your trade may be frontrun.
                    </p>
                  )}
                  <div className="mt-4 text-xs font-medium">Transaction deadline</div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={deadlineMins}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v)) setDeadlineMins(Math.max(1, Math.min(180, Math.round(v))));
                      }}
                      className="w-20 rounded-lg border border-border bg-panel2 px-2 py-1.5 text-right text-xs outline-none focus:border-accent"
                    />
                    <span className="text-xs text-muted">minutes</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* From */}
      <div className="rounded-xl border border-border bg-panel2 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>From</span>
          {balanceIn && address && (
            <div className="flex items-center gap-2">
              <span>
                Balance: {formatBalance(balanceIn.value, tokenIn.decimals)} {tokenIn.symbol}
              </span>
              <button
                onClick={() => handlePercent(50)}
                className="rounded border border-border px-1.5 py-0.5 text-[10px] hover:border-accent hover:text-white"
              >
                50%
              </button>
              <button
                onClick={handleMax}
                className="rounded border border-accent px-1.5 py-0.5 text-[10px] text-accent hover:bg-accent/10"
              >
                MAX
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="flex-1 bg-transparent text-2xl outline-none placeholder:text-muted"
          />
          <TokenPicker token={tokenIn} tokens={tokens} onSelect={setTokenIn} onImport={handleImportToken} />
        </div>
      </div>

      <div className="my-2 flex justify-center">
        <button
          onClick={handleFlip}
          className="rounded-full border border-border bg-panel2 p-2 hover:border-accent"
          aria-label="Flip"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* To */}
      <div className="rounded-xl border border-border bg-panel2 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>{wrapMode ? "To (1:1)" : "To (estimated, after fee)"}</span>
          {balanceOut && address && (
            <span>
              Balance: {formatBalance(balanceOut.value, tokenOut.decimals)} {tokenOut.symbol}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={quoting && !wrapMode ? "..." : formattedNetOut}
            className="flex-1 bg-transparent text-2xl outline-none placeholder:text-muted"
          />
          <TokenPicker token={tokenOut} tokens={tokens} onSelect={setTokenOut} onImport={handleImportToken} />
        </div>
      </div>

      {rateLabel && (
        <button
          onClick={() => setRateInverted(!rateInverted)}
          className="mt-3 w-full text-center text-xs text-muted hover:text-white"
          title="Click to invert"
        >
          {rateLabel} {quoting && <span className="text-accent">↻</span>}
        </button>
      )}

      {quote && !wrapMode && (
        <div className="mt-3 space-y-1 rounded-lg bg-panel2/60 p-3 text-xs text-muted">
          <div className="flex justify-between">
            <span>Min received</span>
            <span>
              {Number(formatUnits(minOutAfterFee, tokenOut.decimals)).toFixed(6)} {tokenOut.symbol}
            </span>
          </div>
          {quote.impactPct !== null && (
            <div className="flex justify-between">
              <span>Price impact</span>
              <span
                className={
                  quote.impactPct > 5
                    ? "text-red-400"
                    : quote.impactPct > 1
                      ? "text-yellow-400"
                      : "text-green-400"
                }
              >
                {quote.impactPct < 0.01 ? "<0.01" : quote.impactPct.toFixed(2)}%
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Route</span>
            <span>{routeLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage tolerance</span>
            <span>{slippage}%</span>
          </div>
          {quote.route.kind === "direct" && (
            <div className="flex justify-between">
              <span>Pool fee tier (Uniswap LPs)</span>
              <span>{(quote.route.fee / 10000).toFixed(2)}%</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Protocol fee ({FEE_PCT_LABEL})</span>
            <span>
              {Number(formattedFee).toFixed(6)} {tokenOut.symbol}
            </span>
          </div>
        </div>
      )}

      {highImpact && !wrapMode && (
        <div className="mt-3 rounded-lg border border-red-900 bg-red-950/40 p-3 text-xs text-red-300">
          Price impact over 5% — this trade will move the pool price significantly. Consider a
          smaller amount.
        </div>
      )}

      <button
        disabled={buttonDisabled}
        onClick={buttonAction}
        className={`mt-5 w-full rounded-xl py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
          highImpact && !buttonDisabled && !needsApproval
            ? "bg-red-600"
            : "bg-gradient-to-r from-accent to-accent2"
        }`}
      >
        {buttonLabel}
      </button>

      {statusMsg && <p className="mt-3 text-center text-xs text-muted">{statusMsg}</p>}

      {pendingTx && (
        <a
          href={`${explorerBase}${pendingTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs text-accent hover:underline"
        >
          View transaction ↗
        </a>
      )}

      <p className="mt-4 text-center text-[10px] leading-relaxed text-muted">
        Routed via Uniswap V3 (direct and multi-hop). A {FEE_PCT_LABEL} protocol fee on output funds
        BasedSwap operations. Wrapping is free of protocol fees.
      </p>
    </div>
  );
}

function TokenPicker({
  token,
  tokens,
  onSelect,
  onImport,
}: {
  token: Token;
  tokens: readonly Token[];
  onSelect: (t: Token) => void;
  onImport: (address: string) => Promise<Token | null>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
    );
  }, [tokens, query]);

  const queryIsAddress = isAddress(query.trim());
  const showImport = queryIsAddress && filtered.length === 0;

  const handleImportClick = async () => {
    setImporting(true);
    setImportError("");
    const imported = await onImport(query.trim());
    setImporting(false);
    if (imported) {
      onSelect(imported);
      setOpen(false);
      setQuery("");
    } else {
      setImportError("Could not read token — check the address and network.");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          setQuery("");
          setImportError("");
        }}
        className="flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 hover:border-accent"
      >
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-accent to-accent2" />
        <span className="text-sm font-medium">{token.symbol}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border bg-panel p-2 shadow-2xl">
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setImportError("");
              }}
              placeholder="Search or paste token address"
              className="mb-2 w-full rounded-lg border border-border bg-panel2 px-3 py-2 text-sm outline-none focus:border-accent"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="max-h-72 overflow-y-auto">
              {showImport ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-xs text-muted">Token not in list.</p>
                  <button
                    onClick={handleImportClick}
                    disabled={importing}
                    className="mt-2 rounded-lg border border-accent px-3 py-1.5 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
                  >
                    {importing ? "Importing..." : "Import token by address"}
                  </button>
                  {importError && <p className="mt-2 text-[10px] text-red-400">{importError}</p>}
                  <p className="mt-2 text-[10px] text-muted">
                    Anyone can create a token with any name. Verify the address before trading.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted">
                  No tokens match &quot;{query}&quot;
                </div>
              ) : (
                filtered.map((t) => (
                  <button
                    key={t.address + t.symbol}
                    onClick={() => {
                      onSelect(t);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-panel2"
                  >
                    <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent2" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                        {t.symbol}
                        {t.imported && (
                          <span className="rounded border border-yellow-700 px-1 text-[9px] text-yellow-400">
                            imported
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted">{t.name}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="mt-2 border-t border-border px-2 pt-2 text-[10px] text-muted">
              {filtered.length} of {tokens.length} tokens
            </div>
          </div>
        </>
      )}
    </div>
  );
}
