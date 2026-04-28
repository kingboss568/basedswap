"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b border-border bg-panel/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent2 font-bold">
            B
          </div>
          <span className="text-lg font-semibold tracking-tight">BasedSwap</span>
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/" className="text-sm text-white hover:text-accent">
            Swap
          </Link>
          <Link href="/pool" className="text-sm text-muted hover:text-white">
            Pool
          </Link>
          <Link href="/quests" className="text-sm text-muted hover:text-white">
            Quests
          </Link>
          <Link href="/leaderboard" className="text-sm text-muted hover:text-white">
            Leaderboard
          </Link>
        </nav>

        <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
      </div>
    </header>
  );
}
