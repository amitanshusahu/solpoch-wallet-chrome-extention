import type { ApprovalManagerResponseRequest, PopupSignMessageRequest, PopupSignTransactionRequest, PopupSignTransactionsRequest, SignAndSendUsingTransactionRequest } from "../../types/message/zod";

// NOTE: IMPORTANT!!!!!!
// the approval type names and should always start with "APPROVAL_" and should be in uppercase, because we are using these type names as in background/index.ts to forward all req starting with "APPROVAL_" to the approval manager.

export const ApprovalType = {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: "APPROVAL_SIGN_AND_SEND_TRANSACTION",
  APPROVAL_XYZ: "APPROVAL_XYZ",
  APPROVAL_SIGN_TRANSACTION: "APPROVAL_SIGN_TRANSACTION",
  APPROVAL_SIGN_ALL_TRANSACTIONS: "APPROVAL_SIGN_ALL_TRANSACTIONS",
  APPROVAL_SIGN_MESSAGE: "APPROVAL_SIGN_MESSAGE",
} as const;

export interface ApprovalPayload {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: SignAndSendUsingTransactionRequest;
  APPROVAL_XYZ: {
    title: string;
    description: string;
  };
  APPROVAL_SIGN_TRANSACTION: PopupSignTransactionRequest["params"];
  APPROVAL_SIGN_ALL_TRANSACTIONS: PopupSignTransactionsRequest["params"];
  APPROVAL_SIGN_MESSAGE: PopupSignMessageRequest["params"];
}

export interface ApprovalManagerResponse {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: ApprovalManagerResponseRequest & {
    tx: SignAndSendUsingTransactionRequest["transaction"];
    password: string;
  };
  APPROVAL_XYZ: ApprovalManagerResponseRequest;
  APPROVAL_SIGN_TRANSACTION: ApprovalManagerResponseRequest & {
    tx: PopupSignTransactionRequest["params"]["transaction"];
    password: string;
  };
  APPROVAL_SIGN_ALL_TRANSACTIONS: ApprovalManagerResponseRequest & {
    txs: PopupSignTransactionsRequest["params"]["transactions"];
    password: string;
  };
  APPROVAL_SIGN_MESSAGE: ApprovalManagerResponseRequest & {
    password: string;
  };
}

export interface ApprovalRequest<T extends keyof ApprovalPayload> {
  id: string;
  type: T;
  origin: string;
  icon?: string;
  payload: ApprovalPayload[T];
}

export interface ArrpovalMapData<T extends keyof ApprovalPayload = keyof ApprovalPayload> {
  request: ApprovalRequest<T>;
  resolve: (value: ApprovalManagerResponse[T]) => void;
  reject: (reason?: any) => void;
}

// A discriminated union of all possible stored entries, so TypeScript can
// narrow the payload type from the `type` field at runtime.
export type AnyApprovalMapData = {
  [K in keyof ApprovalPayload]: ArrpovalMapData<K>;
}[keyof ApprovalPayload];

export class ApprovalManager {
  private static approvals: Map<string, AnyApprovalMapData> = new Map();

  static async createApproval<T extends keyof ApprovalPayload>(request: ApprovalRequest<T>): Promise<ApprovalManagerResponse[T]> {
    const approvalPromise = new Promise<ApprovalManagerResponse[T]>((resolve, reject) => {
      this.approvals.set(request.id, { request, resolve, reject } as any);
    });
    return approvalPromise;
  }

  /**
   * Returns the stored ApprovalRequest narrowed to the correct payload type
   * when you pass a concrete `type` literal as the second argument.
   *
   * Usage:
   *   const req = ApprovalManager.getApproval(id, "APPROVAL_SIGN_AND_SEND_TRANSACTION");
   *   // req is ApprovalRequest<"APPROVAL_SIGN_AND_SEND_TRANSACTION"> | undefined
   */
  static getApproval<T extends keyof ApprovalPayload>(id: string, type: T): ApprovalRequest<T> | undefined;
  static getApproval(id: string): ApprovalRequest<keyof ApprovalPayload> | undefined;
  static getApproval<T extends keyof ApprovalPayload>(id: string, type?: T): ApprovalRequest<T | keyof ApprovalPayload> | undefined {
    const entry = this.approvals.get(id);
    if (!entry) return undefined;
    if (type !== undefined && entry.request.type !== type) {
      console.warn(`ApprovalManager.getApproval: expected type "${type}" but found "${entry.request.type}" for id "${id}"`);
      return undefined;
    }
    return entry.request as ApprovalRequest<T>;
  }

  /**
   * Resolves the approval only when the stored entry's type matches T,
   * preventing mismatched resolve payloads from ever reaching the promise.
   */
  static resolveApproval<T extends keyof ApprovalManagerResponse>(id: string, value: ApprovalManagerResponse[T] & { id: string }): void {
    const approvalData = this.approvals.get(id);
    if (!approvalData) return;
    if (approvalData.request.type !== (value as any).type && !('approved' in value)) {
      // type field may not be present on the resolve payload — fall through safely
    }
    (approvalData.resolve as (v: ApprovalManagerResponse[T]) => void)(value);
    this.approvals.delete(id);
  }

  static rejectApproval(id: string, reason?: any) {
    const approvalData = this.approvals.get(id);
    if (approvalData) {
      approvalData.reject(reason);
      this.approvals.delete(id);
    }
  }

  static clearApprovals() {
    for (const [_id, approval] of this.approvals) {
      approval.reject(new Error("Approval manager reset"))
    }
    this.approvals.clear()
  }

  static handleWindowClosed(windowId: number, approvalId: string) {
    const onRemove = (removedWindowId: number) => {
      if (removedWindowId == windowId) {
        this.rejectApproval(approvalId, new Error("User closed the approval window"));
        chrome.windows.onRemoved.removeListener(onRemove);
      }
    }

    chrome.windows.onRemoved.addListener(onRemove);
  }
}