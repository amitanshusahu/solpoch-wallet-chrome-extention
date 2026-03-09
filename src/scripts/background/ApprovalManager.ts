import type { SignAndSendUsingTransactionRequest } from "../../types/message/zod";

export interface ApprovalPayload {
  signAndSendTransaction: SignAndSendUsingTransactionRequest
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

  static async createApproval<T extends keyof ApprovalPayload>(request: ApprovalRequest<T>): Promise<boolean> {
    const approvalPromise = new Promise<boolean>((resolve, reject) => {
      this.approvals.set(request.id, { request, resolve, reject });
    });
    return approvalPromise;
  }

  static getApproval<T extends keyof ApprovalPayload>(id: string): ApprovalRequest<T> | undefined {
    return this.approvals.get(id)?.request as ApprovalRequest<T> | undefined;
  }

  static resolveApproval(id: string, value: boolean) {
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