import { ApprovalManager, type ApprovalManagerResponse, type ApprovalRequest } from "../../../scripts/background/ApprovalManager";
import type { MessageMap, MessageRequest, MessageResponse } from "../../../types/message";
import { ApprovalResponseRequestSchema, UnlockPopupResponseRequestSchema } from "../../../types/message/zod";

export async function openApprovalPopup(origin: string, logoUrl?: string): Promise<boolean> {
  console.log(`Opening approval popup for origin: ${origin}, logoUrl: ${logoUrl}`);
  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/connect?origin=" + origin + (logoUrl ? "&logoUrl=" + encodeURIComponent(logoUrl) : "")),
    type: "popup",
    width: 400,
    height: 600,
  });

  // wait for response from popup
  return new Promise((resolve) => {
    // create a message listener for the approval response
    const messageHandler = <T extends keyof MessageMap>(
      message: MessageRequest<T>,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (res: MessageResponse<T>) => void
    ): boolean => {
      if (message.type === "APPROVAL_RESPONSE") {
        const payload = ApprovalResponseRequestSchema.parse(message.payload);
        chrome.runtime.onMessage.removeListener(messageHandler);

        if (popupWindow) {
          if (popupWindow.id) {
            chrome.windows.remove(popupWindow.id);
          }
        }
        resolve(payload.approved);
        sendResponse({
          success: true,
          data: null
        });
      }
      return true;
    };

    // register the message listener, 
    // both event listeners for background and popup can coexist, 
    // so we can send response from main background/index.ts handler or popup handler
    // we are adding this listener here to specifically listen for approval response from popup, and we will remove this listener once we get the response, so it won't interfere with other message handling in background/index.ts. we are adding it also because we want to resolve the promise as soon as we get the response from popup, and we don't want to wait for the main background/index.ts handler to process the message and send response back, which can cause unnecessary delay in resolving the promise.
    chrome.runtime.onMessage.addListener(messageHandler);

    // if popup is closed without response, resolve as false
    chrome.windows.onRemoved.addListener(function onWindowRemoved(windowId) {
      if (popupWindow) {
        if (windowId === popupWindow.id) {
          chrome.windows.onRemoved.removeListener(onWindowRemoved);
          chrome.runtime.onMessage.removeListener(messageHandler);
          resolve(false);
        }
      }
    });
  });
}

export async function openUnlockPopup(): Promise<boolean> {
  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/unlock"),
    type: "popup",
    width: 400,
    height: 600,
  });

  return new Promise((resolve) => {
    const messageHandler = <T extends keyof MessageMap>(
      message: MessageRequest<T>,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (res: MessageResponse<T>) => void
    ): boolean => {
      if (message.type === "UNLOCK_POPUP_RESPONSE") {
        const payload = UnlockPopupResponseRequestSchema.parse(message.payload);
        chrome.runtime.onMessage.removeListener(messageHandler);

        if (popupWindow) {
          if (popupWindow.id) {
            chrome.windows.remove(popupWindow.id);
          }
        }
        resolve(payload.approved);
        sendResponse({
          success: true,
          data: null
        });
      }
      return true;
    };

    chrome.runtime.onMessage.addListener(messageHandler);

    // if popup is closed without response, reject the promise
    chrome.windows.onRemoved.addListener(function onWindowRemoved(windowId) {
      if (popupWindow) {
        if (windowId === popupWindow.id) {
          chrome.windows.onRemoved.removeListener(onWindowRemoved);
          chrome.runtime.onMessage.removeListener(messageHandler);
          resolve(false);
        }
      }
    });
  })
}


export async function openSignAndSendPopup(
  payload: MessageRequest<"POPUP_SIGN_AND_SEND_TRANSACTION">["payload"]
): Promise<ApprovalManagerResponse["signAndSendTransaction"]> {
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"signAndSendTransaction"> = {
    id,
    type: "signAndSendTransaction",
    origin: payload.metadata.origin,
    icon: payload.metadata.favicon,
    payload: payload.params
  }

  const approvalPromise = ApprovalManager.createApproval(request);
  console.log('Created approval request with id:', id, 'and payload:', request);

  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/sign-and-send-approval?id=" + id),
    type: "popup",
    width: 400,
    height: 600,
  });

  console.log('Opened sign and send approval popup with id:', id, 'and window id:', popupWindow?.id);

  if (popupWindow && popupWindow.id) {
    ApprovalManager.handleWindowClosed(popupWindow.id, id);
  }

  return approvalPromise
}