import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liquidity Pools — BasedSwap",
  description:
    "Add liquidity to Uniswap V3 pools across 7 EVM chains via BasedSwap. Earn fees on every swap routed through the pool.",
  alternates: { canonical: "/pool" },
  openGraph: {
    title: "Liquidity Pools — BasedSwap",
    description:
      "Add liquidity to Uniswap V3 pools across 7 EVM chains via BasedSwap.",
    url: "https://basedswap-azure.vercel.app/pool",
    type: "website",
  },
};

export default function PoolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
