import type { SimulatedTransactionResponse } from "@solana/web3.js";
import type { Account } from "../vault";
import type { ApprovalResponseRequest, ConnectWalletRequest, GetApprovalsFromManagerRequest, PopupSignAndSendTransactionRequest, SendTransactionRequest, SignAndSendUsingTransactionRequest, UnlockPopupResponseRequest, VaultCreateRequest, VaultUnlockRequest } from "./zod";
import type { ApprovalManagerResponse, ApprovalPayload, ApprovalRequest } from "../../scripts/background/ApprovalManager";

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

  SIGN_AND_SEND_TRANSACTION: {
    req: SendTransactionRequest;
    res: string; // transaction signature
  }

  SIMULATE_TRANSACTION: {
    req: SendTransactionRequest;
    res: SimulatedTransactionResponse;
  }

  POPUP_SIGN_AND_SEND_TRANSACTION: {
    req: PopupSignAndSendTransactionRequest;
    res: { signature: string };
  }

  APPROVAL_MANAGER_RESSOLVE: {
    req: ApprovalManagerResponse[keyof ApprovalManagerResponse];
    res: null;
  }

  GET_APPROVALS_FROM_MANAGER: {
    req: GetApprovalsFromManagerRequest;
    res: ApprovalRequest<keyof ApprovalPayload> | undefined;
  }

  SIGN_AND_SEND_USING_TRANSACTION: {
    req: SignAndSendUsingTransactionRequest;
    res: { signature: string };
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