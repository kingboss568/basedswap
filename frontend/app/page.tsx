import Link from "next/link";
import { SwapCard } from "@/components/SwapCard";
import { QuestPanel } from "@/components/QuestPanel";
import { CHAIN_META, SUPPORTED_CHAIN_IDS } from "@/lib/contracts";

export default function Home() {
  const supportedChainNames = SUPPORTED_CHAIN_IDS.map((id) => CHAIN_META[id]?.name).filter(Boolean);

  return (
    <div className="space-y-12">
      <section className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Trade tokens on{" "}
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
              {SUPPORTED_CHAIN_IDS.length} chains
            </span>
            .<br />
            Earn while you swap.
          </h1>
          <p className="mt-5 max-w-md text-base text-muted">
            BasedSwap routes through Uniswap V3 across {SUPPORTED_CHAIN_IDS.length} networks for the best
            execution, and rewards you with points for daily check-ins and every swap.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            {supportedChainNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-panel2 px-3 py-1.5"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-border bg-panel2 px-3 py-1.5">
              ⚡ +5 pts per swap
            </span>
            <span className="rounded-full border border-border bg-panel2 px-3 py-1.5">
              📅 +10 pts daily
            </span>
            <span className="rounded-full border border-border bg-panel2 px-3 py-1.5">
              🔥 Streak bonus
            </span>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <SwapCard />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <QuestPanel />
        <div className="rounded-2xl border border-border bg-panel p-6">
          <h3 className="text-lg font-semibold">How it works</h3>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <span className="font-bold text-white">1.</span>
              <span>Connect your wallet and switch to any supported chain.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-white">2.</span>
              <span>
                Click <em>Claim daily points</em>. Come back every day to build your streak.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-white">3.</span>
              <span>
                Swap any token. Each successful swap earns +5 points automatically — works on every supported chain.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-white">4.</span>
              <span>
                Check the{" "}
                <Link href="/quests" className="text-accent hover:underline">
                  Quests
                </Link>{" "}
                page anytime to see your progress.
              </span>
            </li>
          </ol>
          <p className="mt-5 text-xs text-muted">
            Note: points are stored locally in your browser for now. A leaderboard with cross-device sync will arrive in a future update.
          </p>
        </div>
      </section>
    </div>
  );
}
