import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const SITE_URL = "https://basedswap-azure.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BasedSwap — Multichain DEX on 7 Networks",
    template: "%s | BasedSwap",
  },
  description:
    "Trade tokens across 7 EVM chains in one UI. Daily check-in points, per-swap rewards, and routing through Uniswap V3. Built for airdrop farmers.",
  applicationName: "BasedSwap",
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
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "PYdGyFZfy6XK_Ahki8z1dxSr4mxO17DQNXTzgeKGzLE",
  },
  openGraph: {
    title: "BasedSwap — Multichain DEX on 7 Networks",
    description:
      "Trade across 7 EVM chains in one UI. Daily check-in points, per-swap rewards, and routing through Uniswap V3.",
    url: SITE_URL,
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
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BasedSwap",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BasedSwap",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Multichain DEX routing through Uniswap V3 on 7 EVM networks, with daily check-in points and per-swap rewards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-bg font-sans text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
