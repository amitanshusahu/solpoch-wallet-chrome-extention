/// <reference types="chrome" />

import { Vault } from "../lib/core/vault";

const vault = new Vault();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {

        case "VAULT_EXISTS":
          sendResponse({ success: true, data: await vault.exists() });
          break;

        case "VAULT_CREATE":
          const mnemonic = await vault.create(message.password);
          sendResponse({ success: true, data: mnemonic });
          break;

        case "VAULT_UNLOCK":
          const keypair = await vault.unlock(message.password);
          sendResponse({
            success: true,
            data: keypair.publicKey.toBase58()
          });
          break;

        case "VAULT_CLEAR":
          await vault.clear();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (err: any) {
      sendResponse({ success: false, error: err.message });
    }
  })();

  // IMPORTANT for async response
  return true;
});