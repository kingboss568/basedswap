import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://basedswap-azure.vercel.app"),
  title: {
    default: "BasedSwap — Multichain DEX on 7 Networks",
    template: "%s | BasedSwap",
  },
  description:
    "Trade tokens across 7 EVM chains in one UI. Daily check-in points, per-swap rewards, and routing through Uniswap V3. Built for airdrop farmers.",
  keywords: [
    "multichain DEX",
    "Base airdrop",
    "Uniswap V3",
    "airdrop farming",
    "crypto swap",
    "DeFi",
    "Base",
    "Arbitrum",
    "Optimism",
    "Polygon",
    "BNB Chain",
    "Avalanche",
  ],
  verification: {
    google: "PYdGyFZfy6XK_Ahki8z1dxSr4mxO17DQNXTzgeKGzLE",
  },
  openGraph: {
    title: "BasedSwap — Multichain DEX on 7 Networks",
    description:
      "Trade across 7 EVM chains in one UI. Daily check-in points, per-swap rewards, and routing through Uniswap V3.",
    url: "https://basedswap-azure.vercel.app",
    siteName: "BasedSwap",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BasedSwap — Multichain DEX on 7 Networks",
    description:
      "Trade across 7 EVM chains in one UI. Daily check-in points, per-swap rewards.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
