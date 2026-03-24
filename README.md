<h1 align="center"> 
    
<img width="300" height="150" alt="logo" src="https://github.com/user-attachments/assets/6b70d1c4-2260-48b7-829f-4f69751cca57" />

A dev-first wallet for Solana

</h1>

<p align="center">
<b>Debug, Inspect, and Understand Every Solana Transaction.</b> <br/>
Stop guessing what your dApp is doing — see it.
</p>

<p align="center">
<a href="https://solpoch-landing-page.vercel.app/">🌐 Website</a> • 
<a href="https://github.com/amitanshusahu/solpoch-wallet-chrome-extention/releases">⬇️ Download Alpha</a> • 
<a href="https://www.youtube.com/watch?v=cXjtx-ihejs">🔗 Demo Video</a>
</p>

<img width="1419" height="1100" alt="product" src="https://github.com/user-attachments/assets/7644edd3-780d-432d-b150-5708a644b65a" />


---

## 🚀 What is Solpoch?

Solpoch is a **developer-first Solana wallet** designed to give you full visibility into what your dApp is doing.

Traditional wallets abstract everything away.  
Solpoch does the opposite.

It lets you:

- Inspect raw transaction instructions
- Simulate before sending
- View program logs
- Understand RPC calls
- Debug faster

> Think of it as **DevTools for Solana transactions**, not just a wallet.

---

## ⚡ Why Solpoch?

Building on Solana is powerful — but debugging is painful.

### Problems today:
- Wallets hide instruction-level details  
- No visibility into what `sendTransaction` actually does  
- Debugging failed transactions is slow  
- Constant context switching (wallet ↔ explorer ↔ code)  

### Solpoch fixes this:
- Shows parsed + raw instructions  
- Simulates transactions with logs before sending  
- Exposes developer-level insights directly in the wallet  
- Makes debugging fast and intuitive  

---

## 🧠 Core Philosophy

> **Don't hide complexity. Surface it.**

Solpoch is built for:
- Developers
- Hackathon builders
- Protocol engineers
- Students learning Solana

---

## ✨ Features

### ✅ Wallet Core
- Wallet Standard compatible (auto-detected by adapters)
- Connect / Disconnect
- signMessage / signIn
- sendTransaction / sendAllTransaction
- signAndSendTransaction / signAndSendAllTransaction

---

### 🔐 Security
- Encrypted vault
- Secure key management

---

### 💸 Transactions
- Send / Receive SOL & SPL tokens
- Multi-token support
- Multi-account manager + account book
- Auto-connect trusted origins

---

### 🧪 Developer Features (Core Differentiator)

#### 🔍 Transaction Simulation
- Simulate before sending
- View program logs
- Catch failures early

#### 🧾 Instruction Parsing
- Decode and display instructions in human-readable format
- Understand what each program is doing

#### 📜 Program Logs
- See logs emitted by programs during execution
- Debug contracts easily

#### 🌐 Devnet First
- Full devnet support
- Build and test freely without mainnet constraints

---

## 🧭 Coming Soon (Vision)

These features define where Solpoch is going:

### 🔌 RPC Inspector
- View all RPC calls made by the wallet
- Inspect params, responses, latency
- Like "Network Tab" for Solana

### 🔁 Transaction Replay
- Replay past transactions
- Modify parameters and re-run
- Debug edge cases easily


### 🧱 Instruction Playground
- Manually construct transactions
- Simulate and send
- Generate code instantly


### 📋 Code View (Huge Feature)
Toggle to see:

```js
window.solana.sendTransaction(...)
```

### 📡 Curl Generator
One-click copy for RPC calls
Pre-filled with your public key and params
```bash
curl https://api.devnet.solana.com \
-X POST \
-d '{...}'
```

---

## 🧠 Future Vision
Solpoch aims to become:
The debugging console for Solana developers
Not just a wallet — but a full developer toolkit.

## 🛠️ Tech Stack / packages used
- Bun, Vite 
- react , typescript, tailwind, zod, zustand
- @solana/web3.js, @solana/spl-token, bip39
- vite-plugin-node-polyfills

## Releases
[Release Page](https://github.com/amitanshusahu/solpoch-wallet-chrome-extention/releases)

## 🛠️ Mannual Build
```bash
# clone the repo
git clone https://github.com/amitanshusahu/solpoch-wallet-chrome-extention & cd solpoch-wallet-chrome-extention

# build the extention
npm i && npm run build
```

## 📓 References
- Repos & Docs
    - [This guide is for wallets that want to implement the Wallet Standard](https://github.com/anza-xyz/wallet-standard/blob/master/WALLET.md)
    - [Backpack has clean wallet standard and Ui popup manager implementaion](https://github.com/coral-xyz/backpack)
    - [Cosmostation has clean vite configs for build](https://github.com/cosmostation/cosmostation-chrome-extension)
- videos
    - [Building Chrome Extention With Vite](https://youtu.be/iBL-vYXk9sc?si=Og0ZFW_FgdGxhSpf)

---

<h1 align="center"> Star the Repo ⭐ </h1>
