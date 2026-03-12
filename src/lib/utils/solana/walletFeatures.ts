import type { IdentifierArray } from "@wallet-standard/base";

export const chains: IdentifierArray = ["solana:devnet"];
export const features: IdentifierArray = [
  "solana:signTransaction",
  "solana:signAllTransactions",
  "solana:signMessage",
  "solana:signIn",
  "solana:signAndSendTransaction"
];