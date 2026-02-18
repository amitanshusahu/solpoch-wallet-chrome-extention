import type { Account } from "../vault";
import type { ConnectWalletRequest, VaultCreateRequest, VaultUnlockRequest } from "./zod";

export type MessageMap = {
  VAULT_EXISTS: {
    req: void;
    res: boolean;
  };

  VAULT_CREATE: {
    req: VaultCreateRequest;
    res: string; // mnemonic
  };

  VAULT_UNLOCK: {
    req: VaultUnlockRequest;
    res: Account;
  };

  VAULT_CLEAR: {
    req: void;
    res: null;
  };

  CONNECT_WALLET: {
    req: ConnectWalletRequest;
    res: { publicKey: string };
  }
};


export type MessageRequest<T extends keyof MessageMap> = {
  type: T;
  payload: MessageMap[T]["req"];
};

export type MessageResponse<T extends keyof MessageMap> = {
  success: boolean;
  data: MessageMap[T]["res"];
  error?: string;
};