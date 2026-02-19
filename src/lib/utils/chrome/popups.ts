import type { MessageMap, MessageRequest, MessageResponse } from "../../../types/message";
import { ApprovalResponseRequestSchema } from "../../../types/message/zod";

export async function openApprovalPopup(origin: string): Promise<boolean> {
  console.log(`Opening approval popup for origin: ${origin}`);
  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html/connect?origin=" + origin),
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