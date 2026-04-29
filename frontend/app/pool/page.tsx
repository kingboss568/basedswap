"use client";

import Link from "next/link";
import { useChainId } from "wagmi";
import {
  CHAIN_META,
  TOKENS,
  SUPPORTED_CHAIN_IDS,
  isSupportedChain,
  BASE,
  type Token,
} from "@/lib/contracts";

export default function PoolPage() {
  const chainId = useChainId();
  const supported = isSupportedChain(chainId);
  const effectiveChainId = supported ? chainId : BASE;
  const meta = CHAIN_META[effectiveChainId];
  const tokens = TOKENS[effectiveChainId] ?? TOKENS[BASE];

  // Generate a few common pairs from this chain's tokens
  const native = tokens.find((t) => t.isNative);
  const stable = tokens.find((t) => t.symbol === "USDC") ?? tokens.find((t) => t.symbol === "USDT");
  const stable2 = tokens.find((t) => t.symbol === "USDT" && t.symbol !== stable?.symbol)
                ?? tokens.find((t) => t.symbol === "DAI");

  type Pool = { name: string; tokenA: Token; tokenB: Token; tagline: string };
  const pools: Pool[] = [];
  if (native && stable) pools.push({ name: `${native.symbol}/${stable.symbol}`, tokenA: native, tokenB: stable, tagline: "Most liquid pair" });
  if (stable && stable2) pools.push({ name: `${stable.symbol}/${stable2.symbol}`, tokenA: stable, tokenB: stable2, tagline: "Stable / stable" });
  // Add another popular pair if available
  const wbtc = tokens.find((t) => t.symbol === "WBTC" || t.symbol === "cbBTC" || t.symbol === "BTCB");
  if (native && wbtc) pools.push({ name: `${native.symbol}/${wbtc.symbol}`, tokenA: native, tokenB: wbtc, tagline: "Crypto majors" });

  // Build Uniswap deep link. Their URL format:
  //   https://app.uniswap.org/positions/create/v3?currencyA=...&currencyB=...&chain=base
  const uniLink = (a: Token, b: Token) => {
    const aParam = a.isNative ? "NATIVE" : a.address;
    const bParam = b.isNative ? "NATIVE" : b.address;
    return `https://app.uniswap.org/positions/create/v3?currencyA=${aParam}&currencyB=${bParam}&chain=${meta?.uniSlug ?? "base"}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Liquidity Pools</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            BasedSwap routes through Uniswap V3 on every chain we support. Add liquidity to any V3
            pool and earn fees on every swap that passes through it. Liquidity management opens in
            the official Uniswap interface.
          </p>
        </div>
        {meta && (
          <span className="shrink-0 rounded-full border border-border bg-panel2 px-3 py-1.5 text-xs">
            {meta.name}
          </span>
        )}
      </div>

      {!supported ? (
        <div className="rounded-2xl border border-yellow-700 bg-yellow-950/30 p-4 text-sm text-yellow-300">
          You&apos;re on an unsupported network. Switch to one of:{" "}
          {SUPPORTED_CHAIN_IDS.map((id) => CHAIN_META[id]?.name).filter(Boolean).join(", ")}.
        </div>
      ) : pools.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-6 text-sm text-muted">
          No suggested pools for this chain yet. You can still add liquidity directly on Uniswap.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((p) => (
            <a
              key={p.name}
              href={uniLink(p.tokenA, p.tokenB)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-border bg-panel p-5 transition hover:border-accent"
            >
              <div className="text-xs text-muted">Add liquidity on {meta?.name}</div>
              <div className="mt-1 text-lg font-semibold">{p.name}</div>
              <div className="mt-2 text-xs text-muted">{p.tagline}</div>
              <div className="mt-4 text-xs text-accent">Open in Uniswap ↗</div>
            </a>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-panel p-6">
        <h3 className="text-lg font-semibold">Supported chains</h3>
        <p className="mt-2 text-sm text-muted">
          Switch your wallet to any of these — BasedSwap automatically detects and uses the right Uniswap V3 deployment.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUPPORTED_CHAIN_IDS.map((id) => (
            <div
              key={id}
              className="rounded-lg border border-border bg-panel2 px-3 py-2 text-center text-sm"
            >
              {CHAIN_META[id]?.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-panel p-6">
        <h3 className="text-lg font-semibold">FAQ</h3>
        <div className="mt-4 space-y-4 text-sm text-muted">
          <div>
            <div className="font-medium text-white">Why does Pool open Uniswap?</div>
            <p className="mt-1">
              BasedSwap aggregates Uniswap V3 liquidity rather than running its own pools. Adding
              liquidity is a Uniswap action — using the official UI ensures you get the latest
              features (concentrated liquidity, fee tiers, position NFTs) and full safety.
            </p>
          </div>
          <div>
            <div className="font-medium text-white">Do I earn fees from BasedSwap traders?</div>
            <p className="mt-1">
              Yes — every swap routed through BasedSwap goes to a Uniswap V3 pool, and the standard
              0.05–1% fee is paid to the LPs of that pool. If you LP that pool, you collect.
            </p>
          </div>
          <div>
            <div className="font-medium text-white">Same wallet earns rewards across chains?</div>
            <p className="mt-1">
              Yes — your wallet address is the same on every EVM chain.{" "}
              <Link href="/quests" className="text-accent hover:underline">
                Quest points
              </Link>{" "}
              accumulate per wallet regardless of which chain you swap on.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
