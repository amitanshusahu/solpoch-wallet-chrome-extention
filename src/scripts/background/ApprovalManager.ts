import type { ApprovalManagerResponseRequest, SignAndSendUsingTransactionRequest } from "../../types/message/zod";

export const ApprovalType = {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: "APPROVAL_SIGN_AND_SEND_TRANSACTION",
  APPROVAL_CONFIRM: "APPROVAL_CONFIRM"
} as const;

export interface ApprovalPayload {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: SignAndSendUsingTransactionRequest;
  APPROVAL_CONFIRM: null;
}

export interface ApprovalManagerResponse {
  APPROVAL_SIGN_AND_SEND_TRANSACTION: ApprovalManagerResponseRequest & {
    tx: SignAndSendUsingTransactionRequest["transaction"];
    password: string;
  };
  APPROVAL_CONFIRM: ApprovalManagerResponseRequest;
}

export interface ApprovalRequest<T extends keyof ApprovalPayload> {
  id: string;
  type: T;
  origin: string;
  icon?: string;
  payload: ApprovalPayload[T];
}

export interface ArrpovalMapData {
  request: ApprovalRequest<keyof ApprovalPayload>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class ApprovalManager {
  private static approvals: Map<string, ArrpovalMapData> = new Map();

  static async createApproval<T extends keyof ApprovalPayload>(request: ApprovalRequest<T>): Promise<ApprovalManagerResponse[T]> {
    const approvalPromise = new Promise<ApprovalManagerResponse[T]>((resolve, reject) => {
      this.approvals.set(request.id, { request, resolve, reject });
    });
    return approvalPromise;
  }

  static getApproval<T extends keyof ApprovalPayload>(id: string): ApprovalRequest<T> | undefined {
    return this.approvals.get(id)?.request as ApprovalRequest<T> | undefined;
  }

  static resolveApproval<T extends keyof ApprovalManagerResponse>(id: string, value: ApprovalManagerResponse[T]): void {
    const approvalData = this.approvals.get(id);
    if (approvalData) {
      approvalData.resolve(value);
      this.approvals.delete(id);
    }
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