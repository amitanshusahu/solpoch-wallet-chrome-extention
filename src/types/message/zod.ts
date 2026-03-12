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
  logoUrl: z.string().optional(),
});
export type ConnectWalletRequest = z.infer<typeof ConnectWalletRequestSchema>;

export const ApprovalResponseRequestSchema = z.object({
  approved: z.boolean(),
});
export type ApprovalResponseRequest = z.infer<typeof ApprovalResponseRequestSchema>;

export const UnlockPopupResponseRequestSchema = z.object({
  approved: z.boolean(),
});
export type UnlockPopupResponseRequest = z.infer<typeof UnlockPopupResponseRequestSchema>;

export const SendTransactionRequestSchema = z.object({
  to: z.string().min(1, "Recipient address is required"),
  amount: z.number().positive("Amount must be a positive number"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type SendTransactionRequest = z.infer<typeof SendTransactionRequestSchema>;

export const PopupSignAndSendTransactionSchema = z.object({
  metadata: z.object({
    origin: z.string().url("Origin must be a valid URL"),
    favicon: z.string().optional(),
  }),
  params: z.object({
    transaction: z.array(z.number()),
    options: z.object({
      skipPreflight: z.boolean().optional(),
      preflightCommitment: z.string().optional(),
      maxRetries: z.number().optional(),
      minContextSlot: z.number().optional(),
    }).optional(),
  }),
});
export type PopupSignAndSendTransactionRequest = z.infer<typeof PopupSignAndSendTransactionSchema>;

export const SigninAndSendUsingTransactionRequestSchema = z.object({
  transaction: z.array(z.number()),
  options: z.object({
    skipPreflight: z.boolean().optional(),
    preflightCommitment: z.string().optional(),
    maxRetries: z.number().optional(),
    minContextSlot: z.number().optional(),
  }).optional(),
});
export type SignAndSendUsingTransactionRequest = z.infer<typeof SigninAndSendUsingTransactionRequestSchema>;

export const ApprovalManagerResponseRequestSchema = z.object({
  id: z.string(),
  approved: z.boolean(),
});
export type ApprovalManagerResponseRequest = z.infer<typeof ApprovalManagerResponseRequestSchema>;

export const GetApprovalsFromManagerRequestSchema = z.object({
  id: z.string(),
  // Optional type hint — when supplied, the background validates the stored
  // entry's type matches before returning it.
  type: z.enum([
    "APPROVAL_SIGN_AND_SEND_TRANSACTION",
    "APPROVAL_SIGN_TRANSACTION",
    "APPROVAL_SIGN_ALL_TRANSACTIONS",
    "APPROVAL_SIGN_MESSAGE"
  ]).optional(),
});
export type GetApprovalsFromManagerRequest = z.infer<typeof GetApprovalsFromManagerRequestSchema>;

export const SimuateUsingTransactionSchema = z.object({
  transaction: z.array(z.number()),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})
export type SimulateUsingTransactionRequest = z.infer<typeof SimuateUsingTransactionSchema>;

export const SimuateUsingTransactionsSchema = z.object({
  transactions: z.array(z.array(z.number())),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})
export type SimulateUsingTransactionsRequest = z.infer<typeof SimuateUsingTransactionsSchema>;

export const PopupSignTransactionSchema = z.object({
  metadata: z.object({
    origin: z.string().url("Origin must be a valid URL"),
    favicon: z.string().optional(),
  }),
  params: z.object({
    transaction: z.array(z.number()),
  }),
});
export type PopupSignTransactionRequest = z.infer<typeof PopupSignTransactionSchema>;

export const PopupSignTransactionsSchema = z.object({
  metadata: z.object({
    origin: z.string().url("Origin must be a valid URL"),
    favicon: z.string().optional(),
  }),
  params: z.object({
    transactions: z.array(z.array(z.number())),
  }),
});
export type PopupSignTransactionsRequest = z.infer<typeof PopupSignTransactionsSchema>;

export const PopupSignMessageSchema = z.object({
  metadata: z.object({
    origin: z.string().url("Origin must be a valid URL"),
    favicon: z.string().optional(),
  }),
  params: z.object({
    message: z.array(z.number()),
  }),
});
export type PopupSignMessageRequest = z.infer<typeof PopupSignMessageSchema>;