/// <reference types="chrome" />

import { vaultService } from "../lib/core/vault/service";
import {
  type MessageMap,
  type MessageRequest,
  type MessageResponse
} from "../types/message";
import {
  VaultCreateRequestSchema,
  VaultUnlockRequestSchema,
  ConnectWalletRequestSchema
} from "../types/message/zod";
import { handleConnectWallet } from "./service";


chrome.runtime.onMessage.addListener(
  <T extends keyof MessageMap>(
    message: MessageRequest<T>,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (res: MessageResponse<T>) => void
  ): boolean => {
    (async () => {
      try {
        switch (message.type) {
          case "LOGGER" : {
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
            const payload = ConnectWalletRequestSchema.parse(message.payload);
            const response = await handleConnectWallet(payload);
            sendResponse({
              success: response.success,
              data: response.data,
              error: response?.error
            });
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
