import type { Keypair } from "@solana/web3.js";
import { decryptMnemonic, encryptMnemonic, keypairFromMnemonic } from "../crypto";
import { generateMnemonic } from "../derivation";

export class Vault {
  async exists(): Promise<boolean> {
    const data = await chrome.storage.local.get("vault");
    return !!data.vault;
  }

  async create(password: string): Promise<string> {
    const mnemonic = generateMnemonic();
    const encrypted = await encryptMnemonic(mnemonic, password);

    await chrome.storage.local.set({ vault: encrypted });

    return mnemonic;
  }

  async unlock(password: string): Promise<Keypair> {
    const { vault } = await chrome.storage.local.get("vault") as { vault: string };
    const mnemonic = await decryptMnemonic(vault, password);

    return keypairFromMnemonic(mnemonic, 0);
  }

  async clear() {
    await chrome.storage.local.remove("vault");
  }
}