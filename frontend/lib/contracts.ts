// =====================================================
// BasedSwap — multi-chain configuration
// =====================================================
// Routes through Uniswap V3's SwapRouter02 on every supported chain.
// All chains share the same FEE_RECIPIENT (because EVM addresses are
// chain-agnostic — same private key = same address everywhere).
//
// Verified against the official Uniswap V3 deployment docs:
//   https://developers.uniswap.org/docs/protocols/v3/deployments

// Chain IDs
export const ETHEREUM = 1;
export const OPTIMISM = 10;
export const BNB = 56;
export const POLYGON = 137;
export const BASE = 8453;
export const BASE_SEPOLIA = 84532;
export const ARBITRUM = 42161;
export const AVALANCHE = 43114;

// Aliases used throughout the app
export const BASE_CHAIN_ID = BASE;
export const BASE_SEPOLIA_CHAIN_ID = BASE_SEPOLIA;

// =====================================================
// PROTOCOL FEE — same recipient on every chain
// =====================================================
export const FEE_BIPS = 10; // 0.10%
export const FEE_RECIPIENT =
  "0x65EF8fd6168A4Bc2CFebf83B0C83a8A9B7AaD1F9" as `0x${string}`;

// =====================================================
// Uniswap V3 contract addresses per chain
// =====================================================
type V3Deployment = {
  swapRouter02: `0x${string}`;
  quoterV2: `0x${string}`;
  weth: `0x${string}`; // wrapped native (WETH on most, WMATIC/WBNB/WAVAX on others)
  factory: `0x${string}`;
};

export const UNISWAP_V3: Record<number, V3Deployment> = {
  // Ethereum mainnet
  [ETHEREUM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  // Optimism
  [OPTIMISM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  // BNB Smart Chain
  [BNB]: {
    swapRouter02: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    quoterV2: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
    weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    factory: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
  },
  // Polygon
  [POLYGON]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WPOL (formerly WMATIC)
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  // Base mainnet
  [BASE]: {
    swapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481",
    quoterV2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
  },
  // Base Sepolia (testnet)
  [BASE_SEPOLIA]: {
    swapRouter02: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
    quoterV2: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  },
  // Arbitrum One
  [ARBITRUM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  },
  // Avalanche C-Chain
  [AVALANCHE]: {
    swapRouter02: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
    quoterV2: "0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F",
    weth: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
    factory: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD",
  },
};

// V3 SwapRouter02 sentinels for multicall recipient
export const ADDRESS_THIS = "0x0000000000000000000000000000000000000002" as `0x${string}`;
export const MSG_SENDER = "0x0000000000000000000000000000000000000001" as `0x${string}`;

// Native token sentinel (UI only — never sent to contracts)
export const NATIVE_TOKEN_SENTINEL = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// V3 fee tiers: 0.01%, 0.05%, 0.30%, 1.00%
export const FEE_TIERS = [500, 3000, 10000, 100] as const;

// Per-chain display name + native currency symbol (used in UI/quest log)
export const CHAIN_META: Record<number, { name: string; nativeSymbol: string; uniSlug: string }> = {
  [ETHEREUM]: { name: "Ethereum", nativeSymbol: "ETH", uniSlug: "mainnet" },
  [OPTIMISM]: { name: "Optimism", nativeSymbol: "ETH", uniSlug: "optimism" },
  [BNB]: { name: "BNB Chain", nativeSymbol: "BNB", uniSlug: "bnb" },
  [POLYGON]: { name: "Polygon", nativeSymbol: "POL", uniSlug: "polygon" },
  [BASE]: { name: "Base", nativeSymbol: "ETH", uniSlug: "base" },
  [BASE_SEPOLIA]: { name: "Base Sepolia", nativeSymbol: "ETH", uniSlug: "base_sepolia" },
  [ARBITRUM]: { name: "Arbitrum", nativeSymbol: "ETH", uniSlug: "arbitrum" },
  [AVALANCHE]: { name: "Avalanche", nativeSymbol: "AVAX", uniSlug: "avalanche" },
};

// Block explorer base URLs (for tx links in the UI)
export const EXPLORER_TX: Record<number, string> = {
  [ETHEREUM]: "https://etherscan.io/tx/",
  [OPTIMISM]: "https://optimistic.etherscan.io/tx/",
  [BNB]: "https://bscscan.com/tx/",
  [POLYGON]: "https://polygonscan.com/tx/",
  [BASE]: "https://basescan.org/tx/",
  [BASE_SEPOLIA]: "https://sepolia.basescan.org/tx/",
  [ARBITRUM]: "https://arbiscan.io/tx/",
  [AVALANCHE]: "https://snowtrace.io/tx/",
};

export type Token = {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  isNative?: boolean;
};

// =====================================================
// Per-chain token lists (popular tokens)
// =====================================================
export const TOKENS: Record<number, readonly Token[]> = {
  [ETHEREUM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
  ],
  [OPTIMISM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
  ],
  [BNB]: [
    { symbol: "BNB", name: "BNB", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WBNB", name: "Wrapped BNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18 },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    { symbol: "ETH", name: "Binance-Peg ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18 },
    { symbol: "BTCB", name: "BTCB Token", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", decimals: 18 },
  ],
  [POLYGON]: [
    { symbol: "POL", name: "Polygon Ecosystem Token", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WPOL", name: "Wrapped POL", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 },
  ],
  [BASE]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18 },
    { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8 },
  ],
  [BASE_SEPOLIA]: [
    { symbol: "ETH", name: "Ether (Sepolia)", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
  ],
  [ARBITRUM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 },
    { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8 },
  ],
  [AVALANCHE]: [
    { symbol: "AVAX", name: "Avalanche", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WAVAX", name: "Wrapped AVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
  ],
};

// Helper: list of supported chain IDs (for UI iterations)
export const SUPPORTED_CHAIN_IDS = [
  ETHEREUM, OPTIMISM, BNB, POLYGON, BASE, ARBITRUM, AVALANCHE,
] as const;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId in UNISWAP_V3;
}
