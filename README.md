# BasedSwap

> A Uniswap V2 fork deployed on Base — full DEX with swap, liquidity, and a frontend.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## ⚠️ Read This First

This codebase is a **starter template**, not a production-ready product. To turn this into something that actually makes money, you still need to:

1. **Hire a Solidity engineer to deploy and operate it.** You don't write code — you cannot do this yourself. Make them verify there is no admin backdoor in the Factory and no fund-extracting logic in the Router.
2. **Pay for a security audit.** Trail of Bits, Code4rena, OpenZeppelin, Hacken — expect USD $15k–$50k. **Skipping the audit = guaranteed exploit.** Hundreds of unaudited V2 forks have been drained over the years.
3. **Provide initial liquidity.** At least USD $30k–$100k, otherwise nobody can use it.
4. **Handle legal compliance.** Taiwan's FSC (金管會) requires VASPs (Virtual Asset Service Providers) to register as of 2024. **Consult a Taiwanese lawyer before going live** to determine whether your operating model requires registration and what AML obligations apply.
5. **Marketing and user acquisition.** No users = no revenue. Budget at least USD $20k.
6. **The name "BasedSwap" is much safer than "BaseSwap"**, but search the chain anyway before launch and confirm no other project is squatting it.

---

## 📁 Project Structure

```
basedswap/
├── contracts/                  # Solidity smart contracts (Uniswap V2 fork)
│   ├── BasedSwapFactory.sol        # Pair factory — creates liquidity pools
│   ├── BasedSwapPair.sol           # Liquidity pool (AMM core logic)
│   ├── BasedSwapRouter02.sol       # User-facing entry point
│   ├── BasedSwapERC20.sol          # LP token base
│   ├── interfaces/                 # Interface definitions
│   └── libraries/                  # Math and helper libraries
├── scripts/
│   ├── deploy.js                   # Deployment script
│   └── getInitCodeHash.js          # Compute pair init code hash
├── frontend/                   # Next.js frontend
│   ├── app/                        # Pages (Next.js App Router)
│   ├── components/                 # React components (Navbar, SwapCard...)
│   └── lib/                        # Config (wagmi, contracts, ABIs)
├── hardhat.config.js
├── package.json
└── .env.example
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Smart contracts | Solidity 0.6.6, Hardhat |
| Networks | Base mainnet (8453), Base Sepolia (84532) |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Web3 | wagmi v2 + viem + RainbowKit |

---

## 🚀 Full Deployment Guide (for your engineer)

### Stage 1 — Local compilation

```bash
npm install
npm run compile
```

### Stage 2 — Deploy to testnet (Base Sepolia)

**Test the full flow on testnet first. Do not skip this.**

```bash
# 1. Set up environment variables
cp .env.example .env

# 2. Edit .env with:
#    - PRIVATE_KEY: deployer wallet's private key (use a fresh empty wallet)
#    - BASESCAN_API_KEY: get one at https://basescan.org/myapikey

# 3. Get testnet ETH from a faucet:
#    https://www.alchemy.com/faucets/base-sepolia
#    https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

# 4. Deploy
npm run deploy:testnet
# Output:
#   BasedSwapFactory deployed to: 0x...
#   BasedSwapRouter02 deployed to: 0x...

# 5. Get the BasedSwapPair init code hash
npm run init-hash

# 6. Replace the hex value in contracts/libraries/BasedSwapLibrary.sol
#    inside pairFor() — swap hex"96e8ac4277..." for your new hash

# 7. Re-deploy (because you modified the library)
npm run deploy:testnet

# 8. Verify on BaseScan
npm run verify:testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARG_1> <CONSTRUCTOR_ARG_2>
```

### Stage 3 — Configure the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local

# 1. Get a free WalletConnect Project ID at https://cloud.walletconnect.com
#    Paste it into .env.local as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# 2. Edit lib/contracts.ts — replace the factory and router addresses
#    for chain id 84532 (Sepolia) with the addresses from Stage 2

# 3. Run dev server
npm run dev
# Open http://localhost:3000, connect wallet (switch to Base Sepolia), test swap
```

### Stage 4 — Seed the first liquidity pool

Deployed contracts alone are useless — without liquidity, nobody can swap. You need to:

1. Pick two test tokens on Base Sepolia (or deploy a mock ERC20 yourself)
2. Call `Router.addLiquidity()` with both tokens
3. Try swapping from the frontend to confirm everything works

Have your engineer write a script for this.

### Stage 5 — Mainnet deployment (only after audit)

```bash
npm run deploy:mainnet
# Then update lib/contracts.ts addresses for chain id 8453
```

**🛑 Do NOT proceed to this stage until:**
- [ ] All testnet flows verified end-to-end
- [ ] At least one professional audit firm has signed off
- [ ] You have at least USD $30k of initial liquidity ready
- [ ] You have completed Taiwan VASP legal consultation
- [ ] You accept full liability for any user funds lost in case of an exploit

---

## 🌐 Deploy the Frontend to the Web

### Vercel (recommended — easiest)

1. Push this repo to GitHub (see section below)
2. Sign up at [vercel.com](https://vercel.com) with your GitHub account
3. Click "Add New Project" → import the repo
4. **Important:** set **Root Directory** to `frontend`
5. Add environment variable `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
6. Click Deploy

You'll get a `xxx.vercel.app` URL within minutes.

### Self-hosted (advanced)

```bash
cd frontend
npm run build
npm start
```

Requires Node.js 18+. Use PM2 or systemd in production.

---

## 💰 Revenue Model (where the protocol earns)

The Uniswap V2 standard is a **0.30% fee per swap**, paid to liquidity providers (LPs).

To make the **protocol (you)** also earn fees:

1. After deployment, call `BasedSwapFactory.setFeeTo(<your treasury address>)`
2. When enabled, the protocol mints extra LP tokens to your treasury whenever LPs withdraw — equivalent to capturing **1/6 of the 0.30% fee** (i.e., 0.05% of every swap)

This logic lives in `BasedSwapPair._mintFee()`. It's the standard Uniswap V2 mechanism — every major fork uses the same model.

---

## 📤 How to Upload to GitHub (beginner-friendly, no command line)

You said you don't code, so here's the fully manual path. **No command line required** — everything happens in a browser.

### Step 1 — Create a GitHub account

If you don't have one, go to [github.com](https://github.com) and sign up. It's free.

### Step 2 — Create a new repository

1. Click the **`+`** icon at the top right → **New repository**
2. **Repository name:** `basedswap` (or whatever you want)
3. **Description:** "A Uniswap V2 fork on Base"
4. Set it to **Public** (required by GPL-3.0 — see License section)
5. Do **NOT** check "Add a README file" or "Add .gitignore" — we already have those
6. Click **Create repository**

### Step 3 — Upload the files (drag and drop)

On the empty repo page, you'll see a link that says:

> "uploading an existing file"

Click it. Then:

1. **Unzip** the `basedswap.zip` file you downloaded from this conversation
2. Open the unzipped `basedswap` folder
3. **Select all files and folders inside** (Ctrl+A on Windows, Cmd+A on Mac)
4. **Drag them** onto the GitHub upload area in your browser
5. Wait for upload to finish (may take a minute)
6. Scroll down → write a commit message like `Initial commit: BasedSwap V2 fork`
7. Click **Commit changes**

Done. Your code is now on GitHub.

### Step 4 — Critical: verify `.env` is NOT uploaded

⚠️ Before sharing the repo URL with anyone, **double-check that `.env` is not in the file list**. If it is, any private key inside is now public and **anyone can drain that wallet**. The `.gitignore` file should prevent this, but verify with your own eyes.

The repo should contain `.env.example` (template) but NOT `.env` (real secrets).

### Step 5 — Share the repo

Your repo URL will be `https://github.com/YOUR_USERNAME/basedswap`. Share this with:
- Engineers you're hiring (so they can clone and deploy)
- Vercel (when deploying the frontend)
- Auditors (when getting a security review)

---

## 🔒 License

This project is licensed under **GPL-3.0** (same as Uniswap V2). This means:

- ✅ You may use it commercially, modify it, and redistribute it
- ⚠️ Any derivative work must also be licensed under GPL-3.0 and open-sourced
- ⚠️ You **cannot** turn this into a closed-source commercial product

This is normal for DEX forks — PancakeSwap, SushiSwap, and others are all GPL-3.0.

---

## 🙏 Credits

This project is derived from [Uniswap V2](https://github.com/Uniswap/v2-core). All original smart-contract logic and architecture belong to Uniswap Labs and contributors.

---

## ⚖️ Disclaimer

This software is provided "as is", without warranty of any kind. **If you deploy it to mainnet without an audit and users lose funds, that liability is yours.** Cryptocurrency is high-risk. Consult local legal counsel before any commercial activity.
