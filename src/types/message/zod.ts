import { z } from "zod";

export const VaultCreateRequestSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type VaultCreateRequest = z.infer<typeof VaultCreateRequestSchema>;

export const VaultUnlockRequestSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type VaultUnlockRequest = z.infer<typeof VaultUnlockRequestSchema>;

export const ConnectWalletRequestSchema = z.object({
  origin: z.string().url("Origin must be a valid URL"),
});
export type ConnectWalletRequest = z.infer<typeof ConnectWalletRequestSchema>;