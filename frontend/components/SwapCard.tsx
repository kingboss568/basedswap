"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { parseUnits, formatUnits, zeroAddress } from "viem";
import { CONTRACTS, TOKENS } from "@/lib/contracts";
import { ROUTER_ABI } from "@/lib/abis";

type Token = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
};

export function SwapCard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const tokens = (TOKENS as any)[chainId] ?? TOKENS[8453];
  const contracts = (CONTRACTS as any)[chainId] ?? CONTRACTS[8453];

  const [tokenIn, setTokenIn] = useState<Token>(tokens[0]);
  const [tokenOut, setTokenOut] = useState<Token>(tokens[2] ?? tokens[1]);
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(0.5); // %

  // Reset tokens when chain changes
  useEffect(() => {
    const list = (TOKENS as any)[chainId] ?? TOKENS[8453];
    setTokenIn(list[0]);
    setTokenOut(list[2] ?? list[1]);
  }, [chainId]);

  const parsedAmountIn = useMemo(() => {
    if (!amountIn || isNaN(Number(amountIn))) return 0n;
    try {
      return parseUnits(amountIn, tokenIn.decimals);
    } catch {
      return 0n;
    }
  }, [amountIn, tokenIn.decimals]);

  // Build swap path. Native ETH uses WETH internally.
  const path = useMemo(() => {
    const inAddr = tokenIn.isNative ? contracts.weth : tokenIn.address;
    const outAddr = tokenOut.isNative ? contracts.weth : tokenOut.address;
    return [inAddr as `0x${string}`, outAddr as `0x${string}`];
  }, [tokenIn, tokenOut, contracts.weth]);

  // Quote: how much of tokenOut you get for `amountIn`?
  const { data: amountsOut, isLoading: quoting } = useReadContract({
    address: contracts.router as `0x${string}`,
    abi: ROUTER_ABI,
    functionName: "getAmountsOut",
    args: parsedAmountIn > 0n ? [parsedAmountIn, path] : undefined,
    query: {
      enabled:
        parsedAmountIn > 0n &&
        contracts.router !== zeroAddress &&
        tokenIn.address !== tokenOut.address,
    },
  });

  const expectedOut = amountsOut ? amountsOut[amountsOut.length - 1] : 0n;
  const formattedOut = expectedOut > 0n ? formatUnits(expectedOut, tokenOut.decimals) : "";
  const minOut = (expectedOut * BigInt(Math.floor((100 - slippage) * 100))) / 10000n;

  const handleFlip = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  };

  const routerNotDeployed = contracts.router === "0x0000000000000000000000000000000000000000";

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-panel p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swap</h2>
        <button
          className="text-xs text-muted hover:text-white"
          onClick={() => {
            const v = prompt("Slippage tolerance (%)", String(slippage));
            if (v && !isNaN(Number(v))) setSlippage(Math.max(0.05, Math.min(50, Number(v))));
          }}
        >
          Slippage: {slippage}%
        </button>
      </div>

      {/* From */}
      <div className="rounded-xl border border-border bg-panel2 p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>From</span>
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

      {/* Flip button */}
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
          <span>To (estimated)</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            readOnly
            placeholder="0.0"
            value={quoting ? "..." : formattedOut}
            className="flex-1 bg-transparent text-2xl outline-none placeholder:text-muted"
          />
          <TokenPicker token={tokenOut} tokens={tokens} onSelect={setTokenOut} />
        </div>
      </div>

      {/* Info */}
      {expectedOut > 0n && (
        <div className="mt-4 space-y-1 rounded-lg bg-panel2/60 p-3 text-xs text-muted">
          <div className="flex justify-between">
            <span>Min received</span>
            <span>
              {formatUnits(minOut, tokenOut.decimals)} {tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Slippage tolerance</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Fee</span>
            <span>0.3%</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!isConnected || routerNotDeployed || parsedAmountIn === 0n}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-accent2 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isConnected
          ? "Connect Wallet to Swap"
          : routerNotDeployed
            ? "Router not deployed yet"
            : parsedAmountIn === 0n
              ? "Enter an amount"
              : "Swap"}
      </button>

      {routerNotDeployed && (
        <p className="mt-3 text-center text-xs text-muted">
          Deploy contracts and update <code>frontend/lib/contracts.ts</code> with the addresses.
        </p>
      )}
    </div>
  );
}

function TokenPicker({
  token,
  tokens,
  onSelect,
}: {
  token: Token;
  tokens: Token[];
  onSelect: (t: Token) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 hover:border-accent"
      >
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-accent to-accent2" />
        <span className="text-sm font-medium">{token.symbol}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-border bg-panel p-2 shadow-2xl">
          {tokens.map((t) => (
            <button
              key={t.address + t.symbol}
              onClick={() => {
                onSelect(t);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-panel2"
            >
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-accent2" />
              <div>
                <div className="text-sm font-medium">{t.symbol}</div>
                <div className="text-xs text-muted">{t.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
