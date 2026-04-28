// =====================================================
// BasedSwap contract addresses
// =====================================================
// After running `npm run deploy:testnet` or `deploy:mainnet`,
// paste the deployed addresses here.

export const CONTRACTS = {
  // Base mainnet (chainId 8453)
  8453: {
    factory: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    router: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    weth: "0x4200000000000000000000000000000000000006" as `0x${string}`,
  },
  // Base Sepolia (chainId 84532)
  84532: {
    factory: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    router: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    weth: "0x4200000000000000000000000000000000000006" as `0x${string}`,
  },
} as const;

// Common tokens — replace these with real token addresses you want to support.
// On Base mainnet: USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
export const TOKENS = {
  8453: [
    {
      symbol: "ETH",
      name: "Ether",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      isNative: true,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      logo: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    },
  ],
  84532: [
    {
      symbol: "ETH",
      name: "Ether (Sepolia)",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  ],
} as const;
