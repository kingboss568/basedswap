// Blog posts data — single source of truth for SEO, listing, and detail pages.
// Adding a new post = add an entry here. No need to touch routing.

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO date "2026-04-29"
  readingTime: string;   // "8 min read"
  tags: string[];
  language: "en" | "zh";
  content: string;       // markdown-lite (we render with simple MD parser, see /blog/[slug]/page.tsx)
};

export const POSTS: BlogPost[] = [
  // ============================================================
  // POST 1 (English) — head SEO target: "best multichain DEX"
  // ============================================================
  {
    slug: "best-multichain-dex-2026",
    title: "Best Multichain DEX in 2026: A Practical Guide for Airdrop Farmers",
    description:
      "Compare the top multichain DEXes in 2026 — fees, supported networks, point systems, and which one to use for cross-chain airdrop farming.",
    date: "2026-04-29",
    readingTime: "9 min read",
    tags: ["multichain", "dex", "airdrop", "guide"],
    language: "en",
    content: `
# Best Multichain DEX in 2026: A Practical Guide for Airdrop Farmers

If you've been farming crypto airdrops for more than a few months, you already know the pain: every chain has its own DEX, every DEX has its own UI, and managing trades across Ethereum, Base, Arbitrum, Optimism, and the rest is a mess of bookmarks and switched RPCs.

A new generation of **multichain DEXes** is fixing this — one wallet, one UI, every chain. This guide walks through the trade-offs in 2026 and what to look for.

## What is a multichain DEX?

A multichain DEX is a frontend that routes your swap through whichever chain you're currently connected to, using existing on-chain liquidity. Most do not deploy their own AMM; instead they aggregate or directly route through proven protocols like Uniswap V3 or Curve.

The advantage is simple: you don't need to learn 7 different interfaces. You connect once, switch networks in your wallet, and everything else stays the same.

## What to look for in 2026

A few things that actually matter when picking a multichain DEX:

**Network coverage.** A DEX that only supports 2 or 3 chains isn't really multichain. Look for at least Ethereum, Arbitrum, Optimism, Base, Polygon, BNB Chain, and Avalanche — those 7 cover roughly 90% of EVM activity by volume.

**Liquidity routing.** This is the most important and most invisible factor. A multichain DEX that builds its own liquidity pools will have terrible execution because no one is providing liquidity for a tiny new project. The best ones route through Uniswap V3 directly, which gives you institutional-grade depth on every chain.

**Protocol fee transparency.** Every multichain DEX needs revenue. Some are quiet about it (1–2% hidden in slippage), others are upfront (0.1–0.3% explicit). Always pick transparent — hidden fees are how amateur projects fund themselves and you end up overpaying.

**Quest or rewards layer.** This is where 2026 diverges from 2024. A DEX without an activity tracking system is throwing away its airdrop potential. The smart move is to use one that tracks your activity per wallet, even if rewards are only "TBD" — you're hedging your future positioning at zero cost.

## The shortlist

A few names worth your attention, in no particular order:

**Matcha.** Aggregates across multiple sources, very deep liquidity. No native rewards layer. Best for one-off large swaps.

**1inch.** The classic. Multi-source routing. Deeper than Matcha on some pairs. Their token (1INCH) launched years ago, so no airdrop angle remaining.

**ParaSwap.** Similar to 1inch. Already had its airdrop.

**Dustswap.** Smaller, Base-focused, has a points system. Limited to fewer chains.

**BasedSwap.** Newest entrant. 7 chains. Routes through Uniswap V3 directly. Daily check-in points + per-swap points + streak bonuses tracked per wallet. 0.10% transparent protocol fee. No token announcement yet.

## A note on airdrop optionality

Here's the math nobody talks about:

If you swap $100 across 5 different DEXes once a month for a year, you've spent maybe $5 in fees total. If even one of those DEXes does a retro airdrop based on activity, the median historical payout for early users has been **$200–$2000** (Uniswap, Arbitrum, Jito, Wormhole, ENS, EigenLayer).

The math says: spread your activity across DEXes that have **not yet** had a token, prioritize ones with explicit point systems (signaling intent to reward), and don't agonize over which one is "the right one." It's a portfolio, not a bet.

## My current rotation

For full transparency: I rotate between BasedSwap (multichain coverage + points), Matcha (large trades), and direct Uniswap (when I want to be sure on Ethereum L1).

BasedSwap is what I built, so obviously biased. But the design principle was specifically "let's build the multichain DEX I wanted to use myself when farming" — and the points system is honest: I'll do a retro airdrop to early users if/when there's a token, no promises beyond that.

## How to actually farm a multichain DEX

A few pragmatic tips after a year of doing this:

**Diversify wallets.** Don't farm all your DEXes from one wallet. If one project's snapshot ends up filtering for "users who only used us" you want to have that profile somewhere.

**Hit every chain at least once.** Many projects weight users by chain diversity. Doing 50 swaps on Ethereum is worth less than 5 swaps each on 10 chains.

**Daily check-ins matter.** Streak bonuses compound. Missing 1 day to break a 30-day streak loses you the multiplier on every previous day.

**Keep it small but consistent.** Swapping $10 worth daily for 90 days is worth more than $1000 once. Activity counts come up in nearly every airdrop formula.

**Document your activity.** Use [DeBank](https://debank.com) or [Zerion](https://zerion.io) to track. When the airdrop announcement happens, you'll already have proof of activity to dispute any wrong filtering.

## Final thoughts

There is no "best" multichain DEX in absolute terms. There's "best for your use case." If you're a whale doing $10k+ swaps, use Matcha for execution. If you're farming airdrops with $50–500 trades, use BasedSwap-class DEXes that have rewards layers. If you trade Ethereum mainnet only, just use Uniswap.

The opportunity cost of using one with a points system over one without is literally zero — both charge similar fees and execute through the same underlying liquidity. So between two equivalent options, always pick the one tracking your activity.

---

*This article is part of [BasedSwap's blog](/blog). Try the DEX at [basedswap-azure.vercel.app](https://basedswap-azure.vercel.app). Daily check-in is free.*
`,
  },

  // ============================================================
  // POST 2 (Chinese) — head SEO target: "Base 撸毛"
  // ============================================================
  {
    slug: "base-airdrop-farming-guide-2026",
    title: "Base 撸毛完整指南 2026 — 從零開始的多鏈空投策略",
    description:
      "Base 鏈撸毛實戰指南。哪些項目值得做、每天花多少時間、如何分散錢包、避開哪些常見錯誤。中文加密圈最完整的 2026 撸毛攻略。",
    date: "2026-04-29",
    readingTime: "12 分鐘",
    tags: ["base", "撸毛", "空投", "教學"],
    language: "zh",
    content: `
# Base 撸毛完整指南 2026 — 從零開始的多鏈空投策略

Base 是 Coinbase 推出的 L2,2024–2025 年成為加密圈最熱的撸毛戰場。但 2026 年的 Base 跟兩年前已經完全不同 — 競爭更激烈、許多項目已經發過幣、新項目門檻提高。這篇文章寫給:**準備開始 Base 撸毛、或想優化現有撸毛策略的人**。

## 為什麼是 Base?

簡單說兩個原因。

第一,**Base 沒有發過官方代幣**。L2 中 Arbitrum、Optimism、ZkSync、Linea 都已發幣,Base 是少數還沒的大型 L2。雖然 Base 從未公開承諾空投,但**歷史上每個沒發幣的 L2 最終都發了**,這是合理的市場期待(注意:這不是保證,只是邏輯推論)。

第二,**Base 上的 DeFi 應用層豐富**。Aerodrome、Morpho、Moonwell、BasedSwap 等項目都有自己的積分或代幣計畫,**撸 Base 等於同時撸十幾個項目**,效率高。

## 第一步:錢包準備

撸毛**最重要的不是錢包數量、而是錢包質量**。多錢包反而容易被 sybil 偵測。

### 推薦設定:3 個錢包,各有用途

| 錢包 | 角色 | 起始資金 |
|---|---|---|
| 主錢包 | 真實活動、長期持倉 | $200–500 |
| 撸毛錢包 1 | 高頻 swap、quest | $100–200 |
| 撸毛錢包 2 | 對照組、不同行為模式 | $50–100 |

**重要:不要用同一個 IP 同時操作多錢包**。Sybil 偵測會看 IP、時間、行為模式相關性。

### 充值到 Base
最便宜的方式有三:
1. **Coinbase 直接提幣**(零手續費,如果你有美國戶頭)
2. **Bridge from Ethereum**:走 [Base 官方 bridge](https://bridge.base.org) — 慢但安全
3. **跨鏈橋**:Stargate、Across — 從 Arbitrum/Optimism 過去最快(<1 分鐘)

## 第二步:每日必做清單(20 分鐘)

這是 2026 年我自己每天做的清單。**重點不是做多,是做穩定**。

### 1. BasedSwap 簽到 + 一筆 swap (3 分鐘)
- 連錢包 → /quests 頁簽到 +10 分
- 隨便做一筆 0.001 ETH 的 swap +5 分
- 有 streak bonus,連續打卡分數倍增

### 2. Aerodrome 投票 (5 分鐘)
- 持有 veAERO 的話每週可投票
- 沒有的話可以從 Aerodrome 上做一筆 swap 累積活動

### 3. Morpho 借貸活動 (5 分鐘)
- supply 一點 USDC 賺利息(同時記錄活動)
- 借出 ETH(就算馬上還也算活動)

### 4. 一筆「真實有意義」的交易 (5 分鐘)
- 別都是 swap 來 swap 去 — 太機械化容易被 sybil 偵測
- 偶爾真的去買個 memecoin、玩個新出的小項目
- 看起來像真實用戶,而不是腳本

### 5. 記錄(2 分鐘)
- 用 DeBank 或 Zerion 看當日活動是否被記錄
- 截圖每月一張,作為日後申訴依據

## 第三步:每週進階任務

每週末花 1 小時做這些:

### 嘗試新項目
**Base 生態每週都有新項目上線**。Twitter 追蹤這幾個帳號:
- @base — 官方
- @builtonbase — 生態整理
- @0xfishylosopher、@cryptopunk7213 — Base 大戶撸毛仔
- DefiLlama 上 Base 的 Top 50 — 每週看一次有沒有新進榜

新項目第一週的 cost 最低、潛在 reward 最高。**寧可分 $5 給 10 個新項目,不要把 $50 押一個老項目**。

### 平衡錢包活動
- 每個錢包都要在所有大鏈(Base + Arbitrum + Optimism + Polygon + BNB)有過活動
- BasedSwap 一站搞定 7 條鏈,適合做這個分散活動的工作

### 評估 ROI
- 把當週投入時間記下來(撸毛很燒時間)
- 估算空投潛在價值 ÷ 投入時數 = 每小時時薪
- 低於 $20/hr 的策略應該砍掉,專注在高 ROI 的項目

## 第四步:常見錯誤

### ❌ 錯誤 1:All-in 到一個錢包
撸毛**不是賭單一錢包能空投越多越好**。多項目都會偵測 sybil(同錢包同行為模式),分散錢包反而更安全。

### ❌ 錯誤 2:做太多、太雜
撸 50 個項目不如撸 10 個項目做精。每個項目要達到「有意義的活動量」才會被採計。例如 Arbitrum 空投時,50 個 swap 才有最低門檻;某些項目要求 $1000+ 累積交易量。

### ❌ 錯誤 3:全自動腳本
跑 bot 看起來很爽但**snapshot 時被一鍵過濾掉**所有腳本帳號。手動 + 不規律時間 + 偶爾失誤,反而像真人。

### ❌ 錯誤 4:只看「保證會發空投」的項目
這種項目早就被卷到不行,reward / cost 比已經很差。**最賺的永遠是「沒人在意但默默有積分系統」的項目**。

### ❌ 錯誤 5:不記錄活動
Snapshot 後常見的爭議:「我明明做了 100 次,為什麼沒被算到」。沒有截圖、交易紀錄,你連申訴的籌碼都沒有。

## 第五步:長期策略 — 把撸毛當投資

把撸毛當成「**支付低成本去獲得選擇權**」這個框架理解最對:

- **每個小項目** = 一個低價認購權(權利金 = 你的 gas 費 + 時間)
- **大部分項目歸零**(沒發空投)
- **少數爆發**(像 Arbitrum、Jito、ENS,單筆 $500–5000)
- **長期分散投資** > **押注單個項目**

數學上,如果你撸 30 個項目、每個花 $10、$50 的時間成本,總投入 $300 + 30 小時。一年中只要有 1 個項目給 $1000 的空投,你就回本還賺。

歷史數據顯示:**過去 3 年認真撸毛的人,平均年化報酬 200–500%**(包含失敗的歸零項目)。

## 推薦工具清單

- **錢包追蹤:** [DeBank](https://debank.com)、[Zerion](https://zerion.io)
- **空投追蹤:** [DropsTab](https://dropstab.com)、[CoinMarketCap Airdrops](https://coinmarketcap.com/airdrop)
- **任務聚合:** Galxe、Layer3、Zealy
- **多鏈 swap:** [BasedSwap](https://basedswap-azure.vercel.app) — 7 條鏈一站搞定
- **bridge:** Stargate、Across、Bungee
- **Gas 監控:** [BaseScan Gas Tracker](https://basescan.org/gastracker)

## 最後一個提醒

**撸毛不是穩賺**。這篇文章不保證任何空投,**過去績效不代表未來**。但對於:
1. 願意花時間
2. 接受可能血本無歸
3. 把它當作低成本選擇權組合

撸毛是少數加密圈裡「**普通人有機會贏過機構**」的賽道,因為機構不屑做這麼瑣碎的事。

---

*本文為 [BasedSwap 部落格](/blog) 系列文章。BasedSwap 是台灣團隊做的 multichain DEX,7 條鏈一站交易 + 簽到積分系統。試試看 [basedswap-azure.vercel.app](https://basedswap-azure.vercel.app)。*
`,
  },

  // ============================================================
  // POST 3 (English, technical) — head SEO target: "uniswap v3 sweepTokenWithFee"
  // ============================================================
  {
    slug: "how-to-add-protocol-fee-uniswap-v3",
    title: "How to Add a Protocol Fee to a Uniswap V3 Frontend (No Custom Contract)",
    description:
      "Tutorial: add a 0.10% protocol fee on swap output using Uniswap V3 SwapRouter02's built-in sweepTokenWithFee and unwrapWETH9WithFee — no audited contract required.",
    date: "2026-04-29",
    readingTime: "11 min read",
    tags: ["uniswap", "tutorial", "defi", "developers"],
    language: "en",
    content: `
# How to Add a Protocol Fee to a Uniswap V3 Frontend (No Custom Contract)

When I started building [BasedSwap](https://basedswap-azure.vercel.app) — a multichain DEX frontend — the first revenue model question was: how do I take a small fee on every swap without deploying my own audited contracts?

It turns out Uniswap's V3 SwapRouter02 has this exact mechanism built in, and it's underdocumented. This post walks through how it works and how to integrate it.

## The mechanism: \`sweepTokenWithFee\` and \`unwrapWETH9WithFee\`

Uniswap V3's SwapRouter02 supports a "multicall" pattern: you can chain multiple operations into a single transaction. Two of those operations are \`sweepTokenWithFee\` (for ERC-20 outputs) and \`unwrapWETH9WithFee\` (for native ETH outputs), which split the output between the recipient and a fee recipient.

Function signatures:

\`\`\`solidity
function sweepTokenWithFee(
  address token,
  uint256 amountMinimum,
  address recipient,
  uint256 feeBips,
  address feeRecipient
) external payable;

function unwrapWETH9WithFee(
  uint256 amountMinimum,
  address recipient,
  uint256 feeBips,
  address feeRecipient
) external payable;
\`\`\`

\`feeBips\` is the protocol fee in basis points, capped at 100 (1.0%). The function transfers \`amount * feeBips / 10000\` to \`feeRecipient\` and the rest to \`recipient\`.

## Why this is great for indie projects

- **No custom contract.** You don't need an audited contract. SwapRouter02 has been battle-tested with billions in volume.
- **No liquidity.** You're using Uniswap's existing pools.
- **Same address across chains.** SwapRouter02 has the same deployment address on most major chains, so your code is portable.
- **Built-in cap.** 100 bips max means you can't accidentally charge an absurd fee — Uniswap rejects anything higher.

## The catch

You can't use \`exactInputSingle\` directly with this pattern. The trick is:

1. Call \`exactInputSingle\` with \`recipient = ADDRESS_THIS\` (a special sentinel meaning "router holds the tokens")
2. In the same multicall, call \`sweepTokenWithFee\` to disburse the held tokens

If your \`exactInputSingle\` sends the tokens directly to the user, the router doesn't have them anymore and \`sweepTokenWithFee\` reverts.

## The integration code

Here's the pattern in viem (TypeScript):

\`\`\`typescript
import { encodeFunctionData } from "viem";

const FEE_BIPS = 10n; // 0.10%
const FEE_RECIPIENT = "0xYourFeeWallet";
const ADDRESS_THIS = "0x0000000000000000000000000000000000000002";

// Step 1: encode the swap, with router as recipient
const swapCall = encodeFunctionData({
  abi: SWAP_ROUTER_ABI,
  functionName: "exactInputSingle",
  args: [{
    tokenIn,
    tokenOut,
    fee: poolFeeTier,
    recipient: ADDRESS_THIS,    // ← router holds tokens
    amountIn,
    amountOutMinimum,
    sqrtPriceLimitX96: 0n,
  }],
});

// Step 2: encode the disbursement with fee
const sweepCall = encodeFunctionData({
  abi: SWAP_ROUTER_ABI,
  functionName: "sweepTokenWithFee",
  args: [
    tokenOut,
    amountOutMinimum,
    userAddress,
    FEE_BIPS,
    FEE_RECIPIENT,
  ],
});

// Step 3: bundle into one transaction
await writeContract({
  address: SWAP_ROUTER_02,
  abi: SWAP_ROUTER_ABI,
  functionName: "multicall",
  args: [[swapCall, sweepCall]],
  value: tokenIn === ETH_SENTINEL ? amountIn : 0n,
});
\`\`\`

## Native token (ETH) outputs

If the user is swapping into native ETH, use \`unwrapWETH9WithFee\` instead. The swap produces WETH; the unwrap call:

1. Unwraps WETH → ETH
2. Splits the ETH between user and fee recipient

\`\`\`typescript
const unwrapCall = encodeFunctionData({
  abi: SWAP_ROUTER_ABI,
  functionName: "unwrapWETH9WithFee",
  args: [
    amountOutMinimum,
    userAddress,
    FEE_BIPS,
    FEE_RECIPIENT,
  ],
});
\`\`\`

## Verification

After a swap, you can verify the fee was taken correctly by checking the transaction's internal transactions on a block explorer. You should see:

- WETH → SwapRouter02 (output of swap)
- SwapRouter02 → feeRecipient (the fee, equal to \`output × feeBips / 10000\`)
- SwapRouter02 → recipient (the rest, \`output × (10000 - feeBips) / 10000\`)

If the math doesn't add up to exactly \`feeBips/10000\`, something is wrong with your encoding.

## Common mistakes

**Forgetting \`ADDRESS_THIS\` in the swap call.** If you set \`recipient: userAddress\` in \`exactInputSingle\`, the user gets all the tokens and the sweep call reverts. Must be \`ADDRESS_THIS\`.

**Wrong sentinel.** \`ADDRESS_THIS\` is \`0x...02\`, not \`0x...01\` (which is \`MSG_SENDER\`). Easy to mix up.

**Charging \`feeBips > 100\`.** SwapRouter02 reverts. Maximum is 1.0%.

**Ignoring decimals on \`amountMinimum\`.** The \`amountMinimum\` argument to the sweep call should match what the swap is expected to produce, not the gross-of-fee number.

## Address reference

SwapRouter02 deployment addresses (verified from official Uniswap docs):

| Chain | SwapRouter02 |
|---|---|
| Ethereum | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| Optimism | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| Arbitrum | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| Polygon | \`0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\` |
| Base | \`0x2626664c2603336E57B271c5C0b26F421741e481\` |
| BNB Chain | \`0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2\` |
| Avalanche | \`0xbb00FF08d01D300023C629E8fFfFcb65A5a578cE\` |

## The economics

At 0.10% (10 bips) — what BasedSwap charges — a $1000 swap generates $1 in protocol fee. Reasonable benchmarks for what's possible:

- 100 swaps/day × $200 avg = $20/day
- 1,000 swaps/day × $200 avg = $200/day
- 10,000 swaps/day × $500 avg = $5,000/day

Uniswap V3's own protocol fee (when enabled) is structured the same way internally, just at a different rate. The mechanism is mature.

## Why I wrote this

I spent two days on the Uniswap docs and Discord trying to figure out the right multicall pattern. The official docs cover \`exactInputSingle\` and the sweep functions separately, but never together as a fee-taking pattern. I'm hoping this saves the next builder some time.

If you're building a DEX frontend, you probably also want to track per-wallet activity (for future airdrops to your users). I cover that in [my next post](/blog).

---

*Try the pattern live on [BasedSwap](https://basedswap-azure.vercel.app) — works across 7 chains. Source code on [GitHub](https://github.com/kingboss568/basedswap).*
`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.date > b.date ? -1 : 1));
}
