import { SwapCard } from "@/components/SwapCard";

export default function Home() {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
      <section>
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Trade tokens on{" "}
          <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
            Base
          </span>
          .<br />
          Earn while you swap.
        </h1>
        <p className="mt-5 max-w-md text-base text-muted">
          BasedSwap is a community-driven DEX with built-in quests, daily check-ins, and rewards. Swap,
          provide liquidity, and climb the leaderboard.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
          <Stat label="Total Volume" value="$0" />
          <Stat label="Total Pairs" value="0" />
          <Stat label="Active Users" value="0" />
        </div>

        <p className="mt-6 text-xs text-muted">
          Stats will populate once contracts are deployed and indexed.
        </p>
      </section>

      <section className="flex justify-center lg:justify-end">
        <SwapCard />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
