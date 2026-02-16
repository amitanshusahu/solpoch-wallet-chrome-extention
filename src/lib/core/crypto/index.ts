import { Keypair } from "@solana/web3.js";

export function encryptMnemonic(mnemonic: string, password: string): Promise<string> {
  return Promise.resolve(btoa(password + mnemonic));
}

export function decryptMnemonic(encrypted: string, password: string): Promise<string> {
  const decrypted = atob(encrypted);
  if (decrypted.startsWith(password)) {
    return Promise.resolve(decrypted.slice(password.length));
  } else {
    return Promise.reject(new Error("Incorrect password"));
  }
}

export function keypairFromMnemonic(_mnemonic: string, _index: number): Keypair {
  return Keypair.generate();
}