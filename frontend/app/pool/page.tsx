"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import {
  CHAIN_META,
  TOKENS,
  UNISWAP_V3,
  FEE_TIERS,
  SUPPORTED_CHAIN_IDS,
  isSupportedChain,
  BASE,
  type Token,
} from "@/lib/contracts";
import { ERC20_ABI, V3_FACTORY_ABI, POSITION_MANAGER_ABI } from "@/lib/abis";

type PoolInfo = {
  fee: number;
  address: `0x${string}`;
  balA: bigint;
  balB: bigint;
};

type PairPools = {
  name: string;
  tokenA: Token;
  tokenB: Token;
  tagline: string;
  pools: PoolInfo[];
};

type Position = {
  tokenId: bigint;
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  liquidity: bigint;
  hasUnclaimedFees: boolean;
};

const MAX_POSITIONS = 20;

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(value: bigint, decimals: number): string {
  const num = Number(formatUnits(value, decimals));
  if (num === 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  if (num < 0.01) return "<0.01";
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function PoolPage() {
  const chainId = useChainId();
  const { address } = useAccount();
  const supported = isSupportedChain(chainId);
  const effectiveChainId = supported ? chainId : BASE;
  const publicClient = usePublicClient({ chainId: effectiveChainId });
  const meta = CHAIN_META[effectiveChainId];
  const tokens = TOKENS[effectiveChainId] ?? TOKENS[BASE];
  const v3 = UNISWAP_V3[effectiveChainId];

  // Suggested pairs from this chain's token list
  const pairs = useMemo(() => {
    const native = tokens.find((t) => t.isNative);
    const stable = tokens.find((t) => t.symbol === "USDC") ?? tokens.find((t) => t.symbol === "USDT");
    const stable2 =
      tokens.find((t) => t.symbol === "USDT" && t.symbol !== stable?.symbol) ??
      tokens.find((t) => t.symbol === "DAI");
    const wbtc = tokens.find((t) => t.symbol === "WBTC" || t.symbol === "cbBTC" || t.symbol === "BTCB");

    const out: Omit<PairPools, "pools">[] = [];
    if (native && stable)
      out.push({ name: `${native.symbol}/${stable.symbol}`, tokenA: native, tokenB: stable, tagline: "Most liquid pair" });
    if (stable && stable2)
      out.push({ name: `${stable.symbol}/${stable2.symbol}`, tokenA: stable, tokenB: stable2, tagline: "Stable / stable" });
    if (native && wbtc)
      out.push({ name: `${native.symbol}/${wbtc.symbol}`, tokenA: native, tokenB: wbtc, tagline: "Crypto majors" });
    return out;
  }, [tokens]);

  // ---- Live pool data: factory.getPool per fee tier, then pool token balances ----
  const [pairPools, setPairPools] = useState<PairPools[] | null>(null);
  const [poolsLoading, setPoolsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient || pairs.length === 0) {
        setPairPools(null);
        return;
      }
      setPoolsLoading(true);
      try {
        // Resolve each pair against every fee tier in one multicall
        const getPoolCalls = pairs.flatMap((p) =>
          FEE_TIERS.map((fee) => ({
            address: v3.factory,
            abi: V3_FACTORY_ABI,
            functionName: "getPool" as const,
            args: [
              p.tokenA.isNative ? v3.weth : p.tokenA.address,
              p.tokenB.isNative ? v3.weth : p.tokenB.address,
              fee,
            ] as const,
          }))
        );
        const poolAddrs = await publicClient.multicall({ contracts: getPoolCalls, allowFailure: true });

        // Collect existing pools and read their token balances (depth proxy)
        type Found = { pairIdx: number; fee: number; address: `0x${string}` };
        const found: Found[] = [];
        poolAddrs.forEach((res, i) => {
          if (res.status === "success" && res.result && res.result !== zeroAddress) {
            found.push({
              pairIdx: Math.floor(i / FEE_TIERS.length),
              fee: FEE_TIERS[i % FEE_TIERS.length],
              address: res.result as `0x${string}`,
            });
          }
        });

        const balCalls = found.flatMap((f) => {
          const p = pairs[f.pairIdx];
          const addrA = p.tokenA.isNative ? v3.weth : p.tokenA.address;
          const addrB = p.tokenB.isNative ? v3.weth : p.tokenB.address;
          return [
            { address: addrA, abi: ERC20_ABI, functionName: "balanceOf" as const, args: [f.address] as const },
            { address: addrB, abi: ERC20_ABI, functionName: "balanceOf" as const, args: [f.address] as const },
          ];
        });
        const bals = found.length > 0 ? await publicClient.multicall({ contracts: balCalls, allowFailure: true }) : [];

        const result: PairPools[] = pairs.map((p) => ({ ...p, pools: [] }));
        found.forEach((f, i) => {
          const balA = bals[i * 2]?.status === "success" ? (bals[i * 2].result as bigint) : 0n;
          const balB = bals[i * 2 + 1]?.status === "success" ? (bals[i * 2 + 1].result as bigint) : 0n;
          result[f.pairIdx].pools.push({ fee: f.fee, address: f.address, balA, balB });
        });
        // Deepest pool first within each pair
        result.forEach((r) => r.pools.sort((a, b) => (b.balA > a.balA ? 1 : -1)));

        if (!cancelled) setPairPools(result);
      } catch {
        if (!cancelled) setPairPools(pairs.map((p) => ({ ...p, pools: [] })));
      } finally {
        if (!cancelled) setPoolsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, pairs, v3.factory, v3.weth]);

  // ---- The user's Uniswap V3 LP positions on this chain ----
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [positionsLoading, setPositionsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!publicClient || !address) {
        setPositions(null);
        return;
      }
      setPositionsLoading(true);
      try {
        const count = (await publicClient.readContract({
          address: v3.positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "balanceOf",
          args: [address],
        })) as bigint;
        const n = Number(count > BigInt(MAX_POSITIONS) ? BigInt(MAX_POSITIONS) : count);
        if (n === 0) {
          if (!cancelled) setPositions([]);
          return;
        }
        const idCalls = Array.from({ length: n }, (_, i) => ({
          address: v3.positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "tokenOfOwnerByIndex" as const,
          args: [address, BigInt(i)] as const,
        }));
        const idResults = await publicClient.multicall({ contracts: idCalls, allowFailure: true });
        const tokenIds = idResults
          .filter((r) => r.status === "success")
          .map((r) => r.result as bigint);

        const posCalls = tokenIds.map((id) => ({
          address: v3.positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "positions" as const,
          args: [id] as const,
        }));
        const posResults = await publicClient.multicall({ contracts: posCalls, allowFailure: true });

        const parsed: Position[] = [];
        posResults.forEach((r, i) => {
          if (r.status !== "success") return;
          const p = r.result as readonly [bigint, string, `0x${string}`, `0x${string}`, number, number, number, bigint, bigint, bigint, bigint, bigint];
          parsed.push({
            tokenId: tokenIds[i],
            token0: p[2],
            token1: p[3],
            fee: Number(p[4]),
            liquidity: p[7],
            hasUnclaimedFees: p[10] > 0n || p[11] > 0n,
          });
        });
        if (!cancelled) setPositions(parsed);
      } catch {
        if (!cancelled) setPositions(null);
      } finally {
        if (!cancelled) setPositionsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [publicClient, address, v3.positionManager]);

  const symbolFor = (addr: string): string => {
    const lower = addr.toLowerCase();
    const t = tokens.find((tok) => tok.address.toLowerCase() === lower);
    if (t) return t.symbol;
    if (lower === v3.weth.toLowerCase()) return "W" + (meta?.nativeSymbol ?? "ETH");
    return shortAddr(addr);
  };

  // Uniswap deep link for adding liquidity to a pair.
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

      {!supported && (
        <div className="rounded-2xl border border-yellow-700 bg-yellow-950/30 p-4 text-sm text-yellow-300">
          You&apos;re on an unsupported network — showing Base data. Switch to one of:{" "}
          {SUPPORTED_CHAIN_IDS.map((id) => CHAIN_META[id]?.name).filter(Boolean).join(", ")}.
        </div>
      )}

      {/* Your positions */}
      <div className="rounded-2xl border border-border bg-panel p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your V3 positions on {meta?.name}</h3>
          <a
            href="https://app.uniswap.org/positions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            Manage on Uniswap ↗
          </a>
        </div>
        {!address ? (
          <p className="mt-3 text-sm text-muted">Connect your wallet to see your LP positions.</p>
        ) : positionsLoading ? (
          <p className="mt-3 text-sm text-muted">Loading positions…</p>
        ) : !positions ? (
          <p className="mt-3 text-sm text-muted">Could not load positions. Try again later.</p>
        ) : positions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No Uniswap V3 positions found on {meta?.name}. Add liquidity to one of the pools below to
            start earning swap fees.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {positions.map((p) => (
              <div
                key={p.tokenId.toString()}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-panel2 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {symbolFor(p.token0)}/{symbolFor(p.token1)}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
                    {(p.fee / 10000).toFixed(2)}%
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      p.liquidity > 0n
                        ? "bg-green-950/50 text-green-400"
                        : "bg-panel text-muted"
                    }`}
                  >
                    {p.liquidity > 0n ? "Active" : "Closed"}
                  </span>
                  {p.hasUnclaimedFees && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                      Unclaimed fees
                    </span>
                  )}
                </div>
                <a
                  href={`https://app.uniswap.org/positions/v3/${meta?.uniSlug ?? "base"}/${p.tokenId.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline"
                >
                  #{p.tokenId.toString()} ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested pools with live depth */}
      <div>
        <h3 className="text-lg font-semibold">Top pools on {meta?.name}</h3>
        <p className="mt-1 text-sm text-muted">
          Live on-chain data — pooled amounts shown per fee tier.
        </p>
        {poolsLoading && !pairPools ? (
          <p className="mt-4 text-sm text-muted">Loading pool data…</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(pairPools ?? pairs.map((p) => ({ ...p, pools: [] as PoolInfo[] }))).map((p) => (
              <a
                key={p.name}
                href={uniLink(p.tokenA, p.tokenB)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-border bg-panel p-5 transition hover:border-accent"
              >
                <div className="text-xs text-muted">{p.tagline}</div>
                <div className="mt-1 text-lg font-semibold">{p.name}</div>
                {p.pools.length === 0 ? (
                  <div className="mt-2 text-xs text-muted">
                    {poolsLoading ? "Checking pools…" : "No pool yet — be the first LP"}
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    {p.pools.slice(0, 3).map((pool) => (
                      <div key={pool.address} className="flex items-center justify-between text-xs">
                        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
                          {(pool.fee / 10000).toFixed(2)}%
                        </span>
                        <span className="text-muted">
                          {formatAmount(pool.balA, p.tokenA.decimals)} {p.tokenA.isNative ? "W" + p.tokenA.symbol : p.tokenA.symbol}
                          {" + "}
                          {formatAmount(pool.balB, p.tokenB.decimals)} {p.tokenB.isNative ? "W" + p.tokenB.symbol : p.tokenB.symbol}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-xs text-accent">Add liquidity on Uniswap ↗</div>
              </a>
            ))}
          </div>
        )}
      </div>

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
