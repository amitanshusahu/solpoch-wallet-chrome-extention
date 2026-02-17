import type { Account } from "../vault";
import { z } from "zod";

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

export const VaultCreateRequestSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type VaultCreateRequest = z.infer<typeof VaultCreateRequestSchema>;
export const VaultUnlockRequestSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type VaultUnlockRequest = z.infer<typeof VaultUnlockRequestSchema>;