export type Account = {
  index: number;
  pubkey: string;
}

interface VaultData {
  encryptedMnemonic: string;
  accounts: Account[];
  activeAccountIndex: number;
  version: number;
}

export interface VaultDataV1 extends VaultData {
  version: 1;
}