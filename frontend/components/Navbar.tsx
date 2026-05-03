"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { loadQuestData } from "@/lib/quests";

export function Navbar() {
  const { address } = useAccount();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!address) {
      setPoints(0);
      return;
    }
    const update = () => setPoints(loadQuestData(address).totalPoints);
    update();
    window.addEventListener("basedswap:quest-updated", update);
    return () => window.removeEventListener("basedswap:quest-updated", update);
  }, [address]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-panel/80 backdrop-blur supports-[backdrop-filter]:bg-panel/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="BasedSwap home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 font-bold">
            B
          </div>
          <span className="text-lg font-semibold tracking-tight">BasedSwap</span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex gap-4 overflow-x-auto text-sm md:gap-6"
        >
          <Link href="/" className="shrink-0 hover:text-accent">
            Swap
          </Link>
          <Link href="/pool" className="shrink-0 text-muted hover:text-white">
            Pool
          </Link>
          <Link href="/quests" className="shrink-0 text-muted hover:text-white">
            Quests
          </Link>
          <Link href="/blog" className="shrink-0 text-muted hover:text-white">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {address && (
            <Link
              href="/quests"
              className="hidden rounded-full border border-border bg-panel2 px-3 py-1.5 text-xs font-medium hover:border-accent sm:block"
              title="View your points"
              aria-label={`View your ${points} BasedSwap points`}
            >
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                ⚡ {points}
              </span>{" "}
              <span className="text-muted">pts</span>
            </Link>
          )}
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </div>
    </header>
  );
}
