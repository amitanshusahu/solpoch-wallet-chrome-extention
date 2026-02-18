import type { MessageMap, MessageRequest, MessageResponse } from "../../../types/message";
import { ApprovalResponseRequestSchema } from "../../../types/message/zod";

export async function openApprovalPopup(origin: string): Promise<boolean> {
  console.log(`Opening approval popup for origin: ${origin}`);
  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/connect?origin=" + origin),
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
    chrome.runtime.onMessage.addListener(messageHandler);
  });
}