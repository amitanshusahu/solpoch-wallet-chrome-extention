/// <reference types="chrome" />

import { Vault } from "../lib/core/vault";
import { VaultCreateRequestSchema, VaultUnlockRequestSchema, type MessageMap, type MessageRequest, type MessageResponse } from "../types/message";

const vault = new Vault();

chrome.runtime.onMessage.addListener(
  <T extends keyof MessageMap>(
    message: MessageRequest<T>,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (res: MessageResponse<T>) => void
  ): boolean => {
    (async () => {
      try {
        switch (message.type) {
          case "VAULT_EXISTS": {
            sendResponse({
              success: true,
              data: await vault.exists(),
            });
            break;
          }

          case "VAULT_CREATE": {
            const payload = VaultCreateRequestSchema.parse(message.payload);
            const mnemonic = await vault.create(payload.password);
            sendResponse({
              success: true,
              data: mnemonic
            });
            break;
          }

          case "VAULT_UNLOCK": {
            const payload = VaultUnlockRequestSchema.parse(message.payload);
            const account = await vault.unlock(payload.password);
            sendResponse({
              success: true,
              data: account
            });
            break;
          }

          case "VAULT_CLEAR": {
            await vault.clear();
            sendResponse({
              success: true,
              data: null
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
