import { QuestPanel } from "@/components/QuestPanel";

export const metadata = {
  title: "Quests — BasedSwap",
};

export default function QuestsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quests</h1>
        <p className="mt-2 text-sm text-muted">
          Earn points by checking in daily and trading. Build a streak for bonus rewards.
        </p>
      </div>

      <QuestPanel />

      <div className="rounded-2xl border border-border bg-panel p-6">
        <h3 className="text-lg font-semibold">Point values</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li className="flex justify-between">
            <span>Daily check-in</span>
            <span className="font-medium text-white">+10</span>
          </li>
          <li className="flex justify-between">
            <span>Each completed swap</span>
            <span className="font-medium text-white">+5</span>
          </li>
          <li className="flex justify-between">
            <span>Streak bonus (per consecutive day)</span>
            <span className="font-medium text-white">+5 (cap +50)</span>
          </li>
        </ul>
        <p className="mt-4 text-xs text-muted">
          Future plans: leaderboard, weekly missions, on-chain points migration.
        </p>
      </div>
    </div>
  );
}
