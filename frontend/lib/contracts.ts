// =====================================================
// BasedSwap — multi-chain configuration
// =====================================================
// Routes through Uniswap V3 SwapRouter02 across 7 chains.
// Same FEE_RECIPIENT collects 0.10% on every swap, on every chain.
// Verified addresses: https://developers.uniswap.org/docs/protocols/v3/deployments

// Chain IDs
export const ETHEREUM = 1;
export const OPTIMISM = 10;
export const BNB = 56;
export const POLYGON = 137;
export const BASE = 8453;
export const BASE_SEPOLIA = 84532;
export const ARBITRUM = 42161;
export const AVALANCHE = 43114;

export const BASE_CHAIN_ID = BASE;
export const BASE_SEPOLIA_CHAIN_ID = BASE_SEPOLIA;

// =====================================================
// PROTOCOL FEE
// =====================================================
export const FEE_BIPS = 10; // 0.10%
export const FEE_RECIPIENT =
  "0x65EF8fd6168A4Bc2CFebf83B0C83a8A9B7AaD1F9" as `0x${string}`;

// =====================================================
// Uniswap V3 deployments
// =====================================================
type V3Deployment = {
  swapRouter02: `0x${string}`;
  quoterV2: `0x${string}`;
  weth: `0x${string}`;
  factory: `0x${string}`;
  positionManager: `0x${string}`;
};

export const UNISWAP_V3: Record<number, V3Deployment> = {
  [ETHEREUM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  [OPTIMISM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  [BNB]: {
    swapRouter02: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    quoterV2: "0x78D78E420Da98ad378D7799bE8f4AF69033EB077",
    weth: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    factory: "0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7",
    positionManager: "0x7b8A01B39D58278b5DE7e48c8449c9f4F5170613",
  },
  [POLYGON]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  [BASE]: {
    swapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481",
    quoterV2: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD",
    positionManager: "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1",
  },
  [BASE_SEPOLIA]: {
    swapRouter02: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4",
    quoterV2: "0xC5290058841028F1614F3A6F0F5816cAd0df5E27",
    weth: "0x4200000000000000000000000000000000000006",
    factory: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
    positionManager: "0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2",
  },
  [ARBITRUM]: {
    swapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  },
  [AVALANCHE]: {
    swapRouter02: "0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE",
    quoterV2: "0xbe0F5544EC67e9B3b2D979aaA43f18Fd87E6257F",
    weth: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    factory: "0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD",
    positionManager: "0x655C406EBFa14EE2006250925e54ec43AD184f8B",
  },
};

export const ADDRESS_THIS = "0x0000000000000000000000000000000000000002" as `0x${string}`;
export const MSG_SENDER = "0x0000000000000000000000000000000000000001" as `0x${string}`;
export const NATIVE_TOKEN_SENTINEL = "0x0000000000000000000000000000000000000000" as `0x${string}`;
export const FEE_TIERS = [500, 3000, 10000, 100] as const;

// Fee tiers tried on each hop of a 2-hop route. Kept short so a quote
// round stays under ~12 RPC calls (all fired in parallel).
export const HOP_FEE_TIERS = [500, 3000] as const;

// Intermediate tokens for multi-hop routing (wrapped native + main stable
// per chain). When no direct pool exists for a pair, we try tokenIn → mid → tokenOut.
export const INTERMEDIATES: Record<number, readonly `0x${string}`[]> = {
  [ETHEREUM]: [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
  ],
  [OPTIMISM]: [
    "0x4200000000000000000000000000000000000006", // WETH
    "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // USDC
  ],
  [BNB]: [
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    "0x55d398326f99059fF775485246999027B3197955", // USDT
  ],
  [POLYGON]: [
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WPOL
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // USDC
  ],
  [BASE]: [
    "0x4200000000000000000000000000000000000006", // WETH
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
  ],
  [BASE_SEPOLIA]: [
    "0x4200000000000000000000000000000000000006", // WETH
  ],
  [ARBITRUM]: [
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC
  ],
  [AVALANCHE]: [
    "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
  ],
};

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
  imported?: boolean; // user-imported via address — show a caution badge
};

// =====================================================
// Token lists — expanded with popular tokens per chain
// =====================================================
// Tokens that don't have V3 liquidity will simply show
// "No liquidity for this pair" when the user tries to swap.
// We err on the side of inclusion so users find what they want.

export const TOKENS: Record<number, readonly Token[]> = {
  [ETHEREUM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
    { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
    { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
    { symbol: "AAVE", name: "Aave", address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", decimals: 18 },
    { symbol: "MKR", name: "Maker", address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", decimals: 18 },
    { symbol: "LDO", name: "Lido DAO", address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", decimals: 18 },
    { symbol: "CRV", name: "Curve DAO", address: "0xD533a949740bb3306d119CC777fa900bA034cd52", decimals: 18 },
    { symbol: "PEPE", name: "Pepe", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18 },
    { symbol: "SHIB", name: "Shiba Inu", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18 },
    { symbol: "FLOKI", name: "Floki", address: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E", decimals: 9 },
    { symbol: "stETH", name: "Lido Staked ETH", address: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", decimals: 18 },
    { symbol: "wstETH", name: "Wrapped stETH", address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", decimals: 18 },
  ],
  [OPTIMISM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", decimals: 8 },
    { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18 },
    { symbol: "VELO", name: "Velodrome", address: "0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db", decimals: 18 },
    { symbol: "SNX", name: "Synthetix", address: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4", decimals: 18 },
    { symbol: "LINK", name: "Chainlink", address: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6", decimals: 18 },
    { symbol: "AAVE", name: "Aave", address: "0x76FB31fb4af56892A25e32cFC43De717950c9278", decimals: 18 },
    { symbol: "PENDLE", name: "Pendle", address: "0xBC7B1Ff1c6989f006a1185318eD4E7b5796e66E1", decimals: 18 },
  ],
  [BNB]: [
    { symbol: "BNB", name: "BNB", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WBNB", name: "Wrapped BNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18 },
    { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    { symbol: "BUSD", name: "Binance USD", address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", decimals: 18 },
    { symbol: "ETH", name: "Binance-Peg ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18 },
    { symbol: "BTCB", name: "BTCB Token", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", decimals: 18 },
    { symbol: "CAKE", name: "PancakeSwap", address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82", decimals: 18 },
    { symbol: "ADA", name: "Cardano (Pegged)", address: "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47", decimals: 18 },
    { symbol: "DOT", name: "Polkadot (Pegged)", address: "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402", decimals: 18 },
    { symbol: "TRX", name: "TRON (Pegged)", address: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3", decimals: 6 },
    { symbol: "DOGE", name: "Dogecoin (Pegged)", address: "0xbA2aE424d960c26247Dd6c32edC70B295c744C43", decimals: 8 },
    { symbol: "LINK", name: "Chainlink", address: "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD", decimals: 18 },
    { symbol: "SHIB", name: "SHIBA INU (BSC)", address: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D", decimals: 18 },
  ],
  [POLYGON]: [
    { symbol: "POL", name: "Polygon Ecosystem Token", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WPOL", name: "Wrapped POL", address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    { symbol: "USDC.e", name: "USD Coin (Bridged)", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8 },
    { symbol: "LINK", name: "Chainlink", address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", decimals: 18 },
    { symbol: "AAVE", name: "Aave", address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", decimals: 18 },
    { symbol: "UNI", name: "Uniswap", address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", decimals: 18 },
    { symbol: "SUSHI", name: "Sushi", address: "0x0b3F868E0BE5597D5DB7fEB59E1CADBb0fdDa50a", decimals: 18 },
    { symbol: "CRV", name: "Curve DAO", address: "0x172370d5Cd63279eFa6d502DAB29171933a610AF", decimals: 18 },
    { symbol: "BAL", name: "Balancer", address: "0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3", decimals: 18 },
  ],
  [BASE]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    { symbol: "USDbC", name: "USD Base Coin (bridged)", address: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", decimals: 18 },
    { symbol: "cbETH", name: "Coinbase Wrapped ETH", address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22", decimals: 18 },
    { symbol: "cbBTC", name: "Coinbase Wrapped BTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", decimals: 8 },
    { symbol: "AERO", name: "Aerodrome", address: "0x940181a94A35A4569E4529A3CDfB74e38FD98631", decimals: 18 },
    { symbol: "DEGEN", name: "Degen", address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed", decimals: 18 },
    { symbol: "BRETT", name: "Brett", address: "0x532f27101965dd16442E59d40670FaF5eBB142E4", decimals: 18 },
    { symbol: "TOSHI", name: "Toshi", address: "0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4", decimals: 18 },
    { symbol: "MOG", name: "Mog Coin", address: "0x2Da56AcB9Ea78330f947bD57C54119Debda7AF71", decimals: 18 },
    { symbol: "VIRTUAL", name: "Virtuals Protocol", address: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", decimals: 18 },
    { symbol: "MORPHO", name: "Morpho", address: "0xBAa5CC21fd487B8Fcc2F632f3F4E8D37262a0842", decimals: 18 },
    { symbol: "TYBG", name: "Based God", address: "0x0d97F261b1e88845184f678e2d1e7a98D9FD38dE", decimals: 18 },
    { symbol: "NORMIE", name: "Normie", address: "0x47b464eDB8Dc9bc67B5cD4C9310BB87B773845BD", decimals: 9 },
  ],
  [BASE_SEPOLIA]: [
    { symbol: "ETH", name: "Ether (Sepolia)", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
  ],
  [ARBITRUM]: [
    { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    { symbol: "USDC.e", name: "USD Coin (Bridged)", address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 },
    { symbol: "DAI", name: "Dai Stablecoin", address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1", decimals: 18 },
    { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8 },
    { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18 },
    { symbol: "GMX", name: "GMX", address: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a", decimals: 18 },
    { symbol: "MAGIC", name: "Magic", address: "0x539bdE0d7Dbd336b79148AA742883198BBF60342", decimals: 18 },
    { symbol: "RDNT", name: "Radiant", address: "0x3082CC23568eA640225c2467653dB90e9250AaA0", decimals: 18 },
    { symbol: "PENDLE", name: "Pendle", address: "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8", decimals: 18 },
    { symbol: "LINK", name: "Chainlink", address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4", decimals: 18 },
    { symbol: "UNI", name: "Uniswap", address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0", decimals: 18 },
    { symbol: "AAVE", name: "Aave", address: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196", decimals: 18 },
    { symbol: "GRAIL", name: "Camelot Token", address: "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8", decimals: 18 },
  ],
  [AVALANCHE]: [
    { symbol: "AVAX", name: "Avalanche", address: NATIVE_TOKEN_SENTINEL, decimals: 18, isNative: true },
    { symbol: "WAVAX", name: "Wrapped AVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 },
    { symbol: "USDC", name: "USD Coin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    { symbol: "USDT", name: "Tether USD", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
    { symbol: "DAI.e", name: "Dai Stablecoin (bridged)", address: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", decimals: 18 },
    { symbol: "WETH.e", name: "Wrapped Ether (bridged)", address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB", decimals: 18 },
    { symbol: "WBTC.e", name: "Wrapped BTC (bridged)", address: "0x50b7545627a5162F82A992c33b87aDc75187B218", decimals: 8 },
    { symbol: "BTC.b", name: "BTC (Avalanche Bridge)", address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50", decimals: 8 },
    { symbol: "JOE", name: "Trader Joe", address: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd", decimals: 18 },
    { symbol: "sAVAX", name: "Staked AVAX", address: "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE", decimals: 18 },
    { symbol: "LINK.e", name: "Chainlink (bridged)", address: "0x5947BB275c521040051D82396192181b413227A3", decimals: 18 },
  ],
};

export const SUPPORTED_CHAIN_IDS = [
  ETHEREUM, OPTIMISM, BNB, POLYGON, BASE, ARBITRUM, AVALANCHE,
] as const;

export function isSupportedChain(chainId: number | undefined): boolean {
  if (!chainId) return false;
  return chainId in UNISWAP_V3;
}

// =====================================================
// Custom (user-imported) tokens — persisted per chain
// =====================================================
const CUSTOM_TOKENS_KEY = (chainId: number) => `basedswap:custom-tokens:${chainId}`;

export function loadCustomTokens(chainId: number): Token[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_TOKENS_KEY(chainId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Token =>
        t && typeof t.symbol === "string" && typeof t.address === "string" && typeof t.decimals === "number"
    );
  } catch {
    return [];
  }
}

export function saveCustomToken(chainId: number, token: Token): Token[] {
  const existing = loadCustomTokens(chainId);
  const lower = token.address.toLowerCase();
  if (existing.some((t) => t.address.toLowerCase() === lower)) return existing;
  const next = [...existing, { ...token, imported: true }];
  try {
    window.localStorage.setItem(CUSTOM_TOKENS_KEY(chainId), JSON.stringify(next));
  } catch {}
  return next;
}

export function removeCustomToken(chainId: number, address: string): Token[] {
  const next = loadCustomTokens(chainId).filter(
    (t) => t.address.toLowerCase() !== address.toLowerCase()
  );
  try {
    window.localStorage.setItem(CUSTOM_TOKENS_KEY(chainId), JSON.stringify(next));
  } catch {}
  return next;
}
