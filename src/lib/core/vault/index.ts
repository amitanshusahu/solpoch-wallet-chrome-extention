import { checkPassword, decryptMnemonic, encryptMnemonic } from "../crypto";
import { generateMnemonic } from "bip39";
import { keypairFromMnemonic, publicKeyFromMnemonic } from "../derivation";
import type { Account, VaultDataV1 } from "../../../types/vault";
import type { Transaction } from "@solana/web3.js";
import { WalletSessionService } from "../walletService/session.service";
import nacl from "tweetnacl";

export class Vault {

  private async getVaultData(): Promise<VaultDataV1> {
    const { vault } = await chrome.storage.local.get("vault") as { vault: VaultDataV1 };
    return vault;
  }

  private async saveVaultData(vaultData: VaultDataV1): Promise<void> {
    await chrome.storage.local.set({ vault: vaultData });
  }

  private async cleanStorage(): Promise<void> {
    await chrome.storage.local.remove("vault");
  }

  private async decryptMnemonicFromPassword(password: string): Promise<string> {
    const vaultData = await this.getVaultData();
    return await decryptMnemonic(vaultData.encryptedMnemonic, password);
  }

  async exists(): Promise<boolean> {
    const data = await this.getVaultData();
    return !!data;
  }

  async getIsUnlocked(): Promise<boolean> {
    return WalletSessionService.getUnlocked();
  }

  async lock() {
    await WalletSessionService.setUnlocked(false);
  }


  async create(password: string): Promise<string> {
    const mnemonic = generateMnemonic();
    const encryptedMnemonic = await encryptMnemonic(mnemonic, password);
    const keypair = publicKeyFromMnemonic(mnemonic, 0);
    console.log("keypair from mnemonic:", keypair);
    const vaultData: VaultDataV1 = {
      encryptedMnemonic: encryptedMnemonic,
      accounts: [{ index: 0, pubkey: keypair }],
      activeAccountIndex: 0,
      version: 1,
    };
    await this.saveVaultData(vaultData);
    return mnemonic; // return unencrypted mnemonic once for backup, will be deleted from memory after this function returns
  }

  async unlock(password: string): Promise<Account> {
    const vaultData = await this.getVaultData();
    const isPasswordCorrect = await checkPassword(vaultData.encryptedMnemonic, password);

    if (!isPasswordCorrect) {
      throw new Error("Incorrect password");
    }
    await WalletSessionService.setUnlocked(true);
    const activeAccount = await this.getActiveAccount();
    return activeAccount;
  }

  async getActiveAccount(): Promise<Account> {
    const vaultData = await this.getVaultData();
    return vaultData.accounts[vaultData.activeAccountIndex];
  }

  async clear() {
    await this.cleanStorage();
    await WalletSessionService.clearSession();
  }

  async signTransaction(tx: Transaction, password: string): Promise<Transaction> {
    const isUnlocked = await this.getIsUnlocked();
    if (!isUnlocked) {
      throw new Error("Vault locked")
    }
    const mnemonic = await this.decryptMnemonicFromPassword(password);
    const activeAccount = await this.getActiveAccount();
    const keypair = keypairFromMnemonic(mnemonic, activeAccount.index)
    tx.sign(keypair)
    return tx
  }

  async singMessage(message: Uint8Array, password: string): Promise<{ signature: Uint8Array }> {
    const isUnlocked = await this.getIsUnlocked();
    if (!isUnlocked) {
      throw new Error("Vault locked")
    }
    const mnemonic = await this.decryptMnemonicFromPassword(password);
    const activeAccount = await this.getActiveAccount();
    const keypair = keypairFromMnemonic(mnemonic, activeAccount.index)
    const signature = nacl.sign.detached(message, keypair.secretKey);
    return { signature };
  }

}