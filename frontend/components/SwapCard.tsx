"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseUnits, formatUnits, maxUint256, encodeFunctionData } from "viem";
import {
  UNISWAP_V3,
  TOKENS,
  FEE_TIERS,
  BASE_CHAIN_ID,
  ADDRESS_THIS,
  FEE_BIPS,
  FEE_RECIPIENT,
  CHAIN_META,
  EXPLORER_TX,
  isSupportedChain,
  type Token,
} from "@/lib/contracts";
import { SWAP_ROUTER_ABI, QUOTER_V2_ABI, ERC20_ABI } from "@/lib/abis";
import { loadQuestData, recordSwap } from "@/lib/quests";

type Quote = { amountOut: bigint; fee: number };

const FEE_PCT_LABEL = (FEE_BIPS / 100).toFixed(2) + "%";

// Reserve a tiny amount of native token for gas when user clicks MAX.
// Same value across chains is fine — gas costs cents on L2s, native is the gas token.
const NATIVE_GAS_RESERVE = parseUnits("0.001", 18);

function formatBalance(value: bigint, decimals: number, places = 4): string {
  const formatted = formatUnits(value, decimals);
  const num = Number(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  return num.toLocaleString(undefined, { maximumFractionDigits: places });
}

export function SwapCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const supported = isSupportedChain(chainId);
  const effectiveChainId = supported ? chainId : BASE_CHAIN_ID;
  const v3 = UNISWAP_V3[effectiveChainId];
  const tokens = TOKENS[effectiveChainId] ?? TOKENS[BASE_CHAIN_ID];
  const meta = CHAIN_META[effectiveChainId];

  const [tokenIn, setTokenIn] = useState<Token>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<Token>(tokens[2] ?? tokens[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>(undefined);
  const [statusMsg, setStatusMsg] = useState<string>("");

  useEffect(() => {
    const list = TOKENS[effectiveChainId] ?? TOKENS[BASE_CHAIN_ID];
    setTokenIn(list[0]);
    setTokenOut(list[2] ?? list[1]);
    setQuote(null);
    setAmountIn("");
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

  // Bumped on every fetchQuote call so a slow stale request can't overwrite a newer result.
  const quoteReqId = useRef(0);

  const fetchQuote = useCallback(async () => {
    const reqId = ++quoteReqId.current;
    if (!publicClient || parsedAmountIn === 0n || !supported) {
      setQuote(null);
      setQuoting(false);
      return;
    }
    if (tokenInForQuote.toLowerCase() === tokenOutForQuote.toLowerCase()) {
      setQuote(null);
      setQuoting(false);
      return;
    }
    setQuoting(true);

    const results = await Promise.all(
      FEE_TIERS.map(async (fee): Promise<Quote | null> => {
        try {
          const result = await publicClient.simulateContract({
            address: v3.quoterV2,
            abi: QUOTER_V2_ABI,
            functionName: "quoteExactInputSingle",
            args: [
              {
                tokenIn: tokenInForQuote,
                tokenOut: tokenOutForQuote,
                amountIn: parsedAmountIn,
                fee,
                sqrtPriceLimitX96: 0n,
              },
            ],
          });
          const amountOut = result.result[0] as bigint;
          return amountOut > 0n ? { amountOut, fee } : null;
        } catch {
          return null;
        }
      })
    );

    if (reqId !== quoteReqId.current) return;

    const best = results.reduce<Quote | null>(
      (acc, q) => (q && (!acc || q.amountOut > acc.amountOut) ? q : acc),
      null
    );
    setQuote(best);
    setQuoting(false);
  }, [publicClient, parsedAmountIn, tokenInForQuote, tokenOutForQuote, v3?.quoterV2, supported]);

  useEffect(() => {
    const t = setTimeout(fetchQuote, 400);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  const { data: allowance } = useReadContract({
    address: tokenIn.isNative ? undefined : tokenIn.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, v3.swapRouter02] : undefined,
    chainId: effectiveChainId,
    query: { enabled: !!address && !tokenIn.isNative && supported },
  });

  const needsApproval = !tokenIn.isNative && (allowance ?? 0n) < parsedAmountIn;
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
      setStatusMsg("Approved! You can now swap.");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (e: any) {
      setStatusMsg(e?.shortMessage || "Approval failed");
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleSwap = async () => {
    if (!address || !quote || parsedAmountIn === 0n || !supported) return;

    const amountOutMinimum =
      (quote.amountOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

    const swapCall = encodeFunctionData({
      abi: SWAP_ROUTER_ABI,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: tokenInForQuote,
          tokenOut: tokenOutForQuote,
          fee: quote.fee,
          recipient: ADDRESS_THIS,
          amountIn: parsedAmountIn,
          amountOutMinimum,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

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

    try {
      setStatusMsg("Sending swap transaction...");
      const hash = await writeContractAsync({
        address: v3.swapRouter02,
        abi: SWAP_ROUTER_ABI,
        functionName: "multicall",
        args: [[swapCall, deliverCall]],
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

  const grossOut = quote?.amountOut ?? 0n;
  const protocolFeeAmount = (grossOut * BigInt(FEE_BIPS)) / 10000n;
  const netOut = grossOut - protocolFeeAmount;
  const formattedNetOut = grossOut > 0n ? formatUnits(netOut, tokenOut.decimals) : "";
  const formattedFee = grossOut > 0n ? formatUnits(protocolFeeAmount, tokenOut.decimals) : "";
  const amountMinimumV3 = quote
    ? (quote.amountOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n
    : 0n;
  const minOutAfterFee = amountMinimumV3 - (amountMinimumV3 * BigInt(FEE_BIPS)) / 10000n;

  let buttonLabel = "Enter an amount";
  let buttonDisabled = true;
  if (!isConnected) {
    buttonLabel = "Connect Wallet to Swap";
  } else if (!supported) {
    buttonLabel = "Switch to a supported network";
  } else if (parsedAmountIn === 0n) {
    buttonLabel = "Enter an amount";
  } else if (tokenIn.address === tokenOut.address && tokenIn.symbol === tokenOut.symbol) {
    buttonLabel = "Pick different tokens";
  } else if (insufficientBalance) {
    buttonLabel = `Insufficient ${tokenIn.symbol} balance`;
  } else if (quoting) {
    buttonLabel = "Fetching best price...";
  } else if (!quote) {
    buttonLabel = "No liquidity for this pair";
  } else if (needsApproval) {
    buttonLabel = `Approve ${tokenIn.symbol}`;
    buttonDisabled = false;
  } else if (txConfirming) {
    buttonLabel = "Confirming on-chain...";
  } else {
    buttonLabel = `Swap ${tokenIn.symbol} for ${tokenOut.symbol}`;
    buttonDisabled = false;
  }

  const explorerBase = EXPLORER_TX[effectiveChainId] ?? EXPLORER_TX[BASE_CHAIN_ID];

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-panel p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swap</h2>
        <div className="flex items-center gap-2">
          {meta && (
            <span className="rounded-full border border-border bg-panel2 px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
              {meta.name}
            </span>
          )}
          <button
            type="button"
            aria-label={`Slippage tolerance, currently ${slippage}%`}
            className="text-xs text-muted hover:text-white"
            onClick={() => {
              const v = prompt("Slippage tolerance (%)", String(slippage));
              if (v && !isNaN(Number(v))) setSlippage(Math.max(0.05, Math.min(50, Number(v))));
            }}
          >
            {slippage}%
          </button>
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
          <TokenPicker token={tokenIn} tokens={tokens} onSelect={setTokenIn} />
        </div>
      </div>

      <div className="my-2 flex justify-center">
        <button
          type="button"
          onClick={handleFlip}
          className="rounded-full border border-border bg-panel2 p-2 hover:border-accent"
          aria-label="Swap from and to tokens"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M7 10l5-5 5 5M7 14l5 5 5-5" />
          </svg>
        </button>
      </div>

      {/* To */}
      <div className="rounded-xl border border-border bg-panel2 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>To (estimated, after fee)</span>
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
            value={quoting ? "..." : formattedNetOut}
            className="flex-1 bg-transparent text-2xl outline-none placeholder:text-muted"
          />
          <TokenPicker token={tokenOut} tokens={tokens} onSelect={setTokenOut} />
        </div>
      </div>

      {quote && (
        <div className="mt-4 space-y-1 rounded-lg bg-panel2/60 p-3 text-xs text-muted">
          <div className="flex justify-between">
            <span>Min received</span>
            <span>
              {Number(formatUnits(minOutAfterFee, tokenOut.decimals)).toFixed(6)} {tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Slippage tolerance</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Pool fee tier (Uniswap LPs)</span>
            <span>{(quote.fee / 10000).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Protocol fee ({FEE_PCT_LABEL})</span>
            <span>
              {Number(formattedFee).toFixed(6)} {tokenOut.symbol}
            </span>
          </div>
        </div>
      )}

      <button
        disabled={buttonDisabled}
        onClick={needsApproval ? handleApprove : handleSwap}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-accent2 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
        Routed via Uniswap V3. A {FEE_PCT_LABEL} protocol fee on output funds BasedSwap operations.
      </p>
    </div>
  );
}

function TokenPicker({
  token,
  tokens,
  onSelect,
}: {
  token: Token;
  tokens: readonly Token[];
  onSelect: (t: Token) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tokens;
    return tokens.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase() === q
    );
  }, [tokens, query]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          setQuery("");
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by symbol, name, or address"
              className="mb-2 w-full rounded-lg border border-border bg-panel2 px-3 py-2 text-sm outline-none focus:border-accent"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
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
                      <div className="truncate text-sm font-medium">{t.symbol}</div>
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
