import type { Account } from "../vault";
import type { ApprovalResponseRequest, ConnectWalletRequest, UnlockPopupResponseRequest, VaultCreateRequest, VaultUnlockRequest } from "./zod";

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
  };

  APPROVAL_RESPONSE: {
    req: ApprovalResponseRequest;
    res: null;
  };

  VAULT_IS_UNLOCKED: {
    req: void;
    res: boolean;
  }

  VAULT_GET_ACTIVE_ACCOUNT: {
    req: void;
    res: Account | null;
  }

  LOGGER: {
    req: string;
    res: null;
  }

  UNLOCK_POPUP_RESPONSE: {
    req: UnlockPopupResponseRequest;
    res: null;
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