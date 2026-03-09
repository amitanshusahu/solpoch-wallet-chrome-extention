import type { SimulatedTransactionResponse } from "@solana/web3.js";
import type { Account } from "../vault";
import type { ApprovalResponseRequest, ConnectWalletRequest, GetApprovalsFromManagerRequest, PopupSignAndSendTransactionRequest, SendTransactionRequest, SimulateUsingTransactionRequest, UnlockPopupResponseRequest, VaultCreateRequest, VaultUnlockRequest } from "./zod";
import type { ApprovalManagerResponse, ApprovalPayload, ApprovalRequest } from "../../scripts/background/ApprovalManager";


/**
 * easy to understnad, generated types (mapping) and then merged them to MessageMap ( type MessageMap =  {...} & ApprovalResolveMap)
 * generates one strongly-typed message entry per ApprovalManagerResponse key.
 *
 * e.g.  APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_AND_SEND_TRANSACTION: {
 *          req: ApprovalManagerResponse["APPROVAL_SIGN_AND_SEND_TRANSACTION"] & { id: string };
 *          res: null;
 *        }
 */
type ApprovalResolveMap = {
  [K in keyof ApprovalManagerResponse as `APPROVAL_MANAGER_RESOLVE_${Uppercase<string & K>}`]: {
    req: ApprovalManagerResponse[K] & { id: string };
    res: null;
  }
};

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

  GET_APPROVALS_FROM_MANAGER: {
    req: GetApprovalsFromManagerRequest & { type?: keyof ApprovalPayload };
    /**
     * NOTE: for future me
     * { [K in keyof ApprovalPayload]: ApprovalRequest<K> }[keyof ApprovalPayload] means "a union of ApprovalRequest for each key in ApprovalPayload". So the response is typed as a union of all possible ApprovalRequest shapes, but you can narrow it at runtime by checking the `type` field. it can also be written as in simpler way like this:
     *   type GetApprovalsFromManagerResponse = {
     *     [K in keyof ApprovalPayload]: ApprovalRequest<K>;
     *   }[keyof ApprovalPayload];
     * 
     *  the above type becomes generatively:
     * type GetApprovalsFromManagerResponse =
     * | ApprovalRequest<"type1">
     * | ApprovalRequest<"type2">
     * | ApprovalRequest<"type3">;
     * 
     * how :
     * 1)key of ApprovalPayload is "type1" | "type2" | "type3"
     * 2) map type
     *  { 
     *    [K in keyof ApprovalPayload]: ApprovalRequest<K> 
     * } 
     * becomes
     * {
     *  type1: ApprovalRequest<"type1">;
     *  type2: ApprovalRequest<"type2">;
     * }
     * 3) Indexed access [keyof ApprovalPayload]
     * example:
     * type abc = {
     *   mkie: string;
     *   tike: number;
     * }
     * type xyz = abc["mkie"] | abc["tike"] 
     * type xyz = abc[keyof abc]
     * 
     * The response is a discriminated union — narrow it via the `type` field in xyz page.tsx where ever send message is used:
     *   if (approval?.type === "APPROVAL_SIGN_AND_SEND_TRANSACTION") {
     *     approval.payload  // typed as SignAndSendUsingTransactionRequest
     *   }
     */
    res: { [K in keyof ApprovalPayload]: ApprovalRequest<K> }[keyof ApprovalPayload] | undefined;
  }

  SIGN_AND_SEND_USING_TRANSACTION: {
    req: SimulateUsingTransactionRequest;
    res: { signature: string };
  }

  SIMULATE_USING_TRANSACTION: {
    req: SimulateUsingTransactionRequest;
    res: SimulatedTransactionResponse;
  }
} & ApprovalResolveMap;


export type MessageRequest<T extends keyof MessageMap> = {
  type: T;
  payload: MessageMap[T]["req"];
};

export type MessageResponse<T extends keyof MessageMap> = {
  success: boolean;
  data: MessageMap[T]["res"];
  error?: string;
};