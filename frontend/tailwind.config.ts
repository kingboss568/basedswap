"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  bsc,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const wagmiConfig = getDefaultConfig({
  appName: "BasedSwap",
  projectId,
  // Chains shown in the wallet connector. Order = display order in the network dropdown.
  // Base first because that's the home chain.
  chains: [base, arbitrum, optimism, polygon, mainnet, bsc, avalanche, baseSepolia],
  ssr: true,
});
