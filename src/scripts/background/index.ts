/// <reference types="chrome" />

import { vaultService } from "../../lib/core/vault/service";
import { TransactionService } from "../../lib/core/walletService/transaction.service";
import { handleConnectWallet, handleSignAndSendTransaction } from "../../lib/core/walletService/daap.service";
import {
  type MessageMap,
  type MessageRequest,
  type MessageResponse
} from "../../types/message";
import {
  VaultCreateRequestSchema,
  VaultUnlockRequestSchema,
  ConnectWalletRequestSchema,
  SendTransactionRequestSchema,
  PopupSignAndSendTransactionSchema,
  GetApprovalsFromManagerRequestSchema
} from "../../types/message/zod";
import { ApprovalManager, type ApprovalManagerResponse } from "./ApprovalManager";


chrome.runtime.onMessage.addListener(
  <T extends keyof MessageMap>(
    message: MessageRequest<T>,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (res: MessageResponse<T>) => void
  ): boolean => {
    // NOTE : for future me
    // Don't handle APPROVAL_RESPONSE here — it's handled by the
    // temporary listener created in openApprovalPopup().
    // Returning false tells Chrome this listener won't send a response,
    // so the other listener's sendResponse stays valid (handleConnectWallet -> openPopup -> listener).
    const avoidTypes = ["APPROVAL_RESPONSE", "UNLOCK_POPUP_RESPONSE"] as (keyof MessageMap)[];
    if (avoidTypes.includes(message.type)) {
      return false;
    }

    (async () => {
      try {
        switch (message.type) {
          case "LOGGER": {
            console.log("Logger Message from Content Script:", message.payload);
            sendResponse({
              success: true,
              data: null
            });
            break;
          }

          case "VAULT_EXISTS": {
            sendResponse({
              success: true,
              data: await vaultService.exists(),
            });
            break;
          }

          case "VAULT_CREATE": {
            const payload = VaultCreateRequestSchema.parse(message.payload);
            const mnemonic = await vaultService.create(payload.password);
            sendResponse({
              success: true,
              data: mnemonic
            });
            break;
          }

          case "VAULT_UNLOCK": {
            const payload = VaultUnlockRequestSchema.parse(message.payload);
            const account = await vaultService.unlock(payload.password);
            sendResponse({
              success: true,
              data: account
            });
            break;
          }

          case "VAULT_CLEAR": {
            await vaultService.clear();
            sendResponse({
              success: true,
              data: null
            });
            break;
          }

          case "VAULT_IS_UNLOCKED": {
            const isUnlocked = await vaultService.getIsUnlocked();
            sendResponse({
              success: true,
              data: isUnlocked
            });
            break;
          }

          case "VAULT_GET_ACTIVE_ACCOUNT": {
            const activeAccount = await vaultService.getActiveAccount();
            sendResponse({
              success: true,
              data: activeAccount
            });
            break;
          }

          case "CONNECT_WALLET": {
            console.log('Received CONNECT_WALLET message in background:', message);
            const payload = ConnectWalletRequestSchema.parse(message.payload);
            const response = await handleConnectWallet(payload);
            console.log('Response from handleConnectWallet:', response);
            sendResponse({
              success: response.success,
              data: response.data,
              error: response?.error
            });
            break;
          }

          case "POPUP_SIGN_AND_SEND_TRANSACTION": {
            console.log('Received POPUP_SIGN_AND_SEND_TRANSACTION message in background:', message);
            const payload = PopupSignAndSendTransactionSchema.parse(message.payload);
            const response = await handleSignAndSendTransaction(payload);
            console.log('Response from handleSignAndSendTransaction:', response);
            sendResponse({
              success: response.success,
              data: response.data,
              error: response?.error,
            });
            break;
          }

          case "SIGN_AND_SEND_TRANSACTION": {
            const payload = SendTransactionRequestSchema.parse(message.payload);
            const response = await TransactionService.sendTransaction(payload.to, payload.amount, payload.password);
            sendResponse({
              success: response.success,
              data: response.data,
              error: response?.error,
            });
            break;
          }

          case "SIMULATE_TRANSACTION": {
            const payload = SendTransactionRequestSchema.parse(message.payload);
            const response = await TransactionService.simulateTransaction(payload.to, payload.amount, payload.password);
            sendResponse({
              success: response.success,
              data: response.data,
              error: response?.error,
            });
            break;
          }

          case "GET_APPROVALS_FROM_MANAGER": {
            const payload = GetApprovalsFromManagerRequestSchema.parse(message.payload);
            // Pass the optional `type` hint so getApproval validates the stored
            // entry matches what the popup expects before sending it back.
            const approvals = payload.type
              ? ApprovalManager.getApproval(payload.id, payload.type)
              : ApprovalManager.getApproval(payload.id);
            sendResponse({
              success: true,
              data: approvals as MessageMap["GET_APPROVALS_FROM_MANAGER"]["res"]
            } as MessageResponse<T>);
            break;
          }

          default: {
            // Auto-generated: handles APPROVAL_MANAGER_RESOLVE_<type> for every ApprovalType
            if (message.type.startsWith("APPROVAL_MANAGER_RESOLVE_")) {
              console.log('Received approval resolution message in background:', message);
              const payload = message.payload as ApprovalManagerResponse[keyof ApprovalManagerResponse] & { id: string };
              ApprovalManager.resolveApproval(payload.id, payload);
              sendResponse({ success: true, data: null });
            }
            break;
          }

        }
      } catch (err) {
        sendResponse({
          success: false,
          error: `Service Worker Caught Errors: ${err}`,
          data: null
        });
      }
    })();

    return true; // Indicates that we will send a response asynchronously
  }
);
