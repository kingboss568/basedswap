"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  loadQuestData,
  performCheckIn,
  canCheckInToday,
  previewCheckInReward,
  type QuestData,
} from "@/lib/quests";

export function QuestPanel() {
  const { address, isConnected } = useAccount();
  const [data, setData] = useState<QuestData | null>(null);
  const [flash, setFlash] = useState<string>("");

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }
    setData(loadQuestData(address));

    // Re-load when other components (e.g. SwapCard) update quest data
    const handler = () => setData(loadQuestData(address));
    window.addEventListener("basedswap:quest-updated", handler);
    return () => window.removeEventListener("basedswap:quest-updated", handler);
  }, [address]);

  if (!isConnected || !address || !data) {
    return (
      <div className="rounded-2xl border border-border bg-panel p-6 text-center">
        <h3 className="text-lg font-semibold">Daily Check-in</h3>
        <p className="mt-2 text-sm text-muted">
          Connect your wallet to start earning points.
        </p>
      </div>
    );
  }

  const canClaim = canCheckInToday(data);
  const reward = previewCheckInReward(data);

  const handleClaim = () => {
    if (!canClaim) return;
    const updated = performCheckIn(address, data);
    if (updated) {
      setData(updated);
      setFlash(`+${updated.totalPoints - data.totalPoints} points!`);
      window.dispatchEvent(new Event("basedswap:quest-updated"));
      setTimeout(() => setFlash(""), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Daily Check-in</h3>
          <p className="mt-1 text-xs text-muted">
            Come back every day to keep your streak going.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{data.totalPoints}</div>
          <div className="text-xs text-muted">Total Points</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Streak" value={`${data.checkInStreak} day${data.checkInStreak === 1 ? "" : "s"}`} />
        <Stat label="Swaps" value={String(data.swapCount)} />
      </div>

      <button
        onClick={handleClaim}
        disabled={!canClaim}
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-accent to-accent2 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {canClaim ? `Claim +${reward} points` : "Already claimed today — come back tomorrow"}
      </button>

      {flash && (
        <div className="mt-3 text-center text-sm font-medium text-accent">{flash}</div>
      )}

      {data.history.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Recent activity
          </h4>
          <div className="space-y-2">
            {data.history.slice(0, 6).map((entry, i) => (
              <ActivityRow key={i} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-panel2 p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function ActivityRow({ entry }: { entry: import("@/lib/quests").ActivityEntry }) {
  const label =
    entry.type === "checkin"
      ? "Daily check-in"
      : entry.type === "streak_bonus"
        ? "Streak bonus"
        : entry.meta
          ? `Swap ${entry.meta.tokenIn} → ${entry.meta.tokenOut}`
          : "Swap";

  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center justify-between rounded-lg bg-panel2/60 px-3 py-2 text-sm">
      <div>
        <div>{label}</div>
        <div className="text-xs text-muted">{timeStr}</div>
      </div>
      <div className="font-medium text-accent">+{entry.points}</div>
    </div>
  );
}
