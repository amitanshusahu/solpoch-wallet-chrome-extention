import { mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";

export function keypairFromMnemonic(mnemonic: string, accountIndex: number): string {
  const seed = mnemonicToSeedSync(mnemonic);
  const path = `m/44'/501'/${accountIndex}'/0'`;
  const derived = derivePath(path, seed.toString("hex"));
  return Keypair.fromSeed(derived.key).publicKey.toBase58();
}