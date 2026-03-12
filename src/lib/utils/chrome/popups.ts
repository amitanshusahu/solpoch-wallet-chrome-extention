import { ApprovalManager, type ApprovalManagerResponse, type ApprovalRequest } from "../../../scripts/background/ApprovalManager";
import type { MessageMap, MessageRequest, MessageResponse } from "../../../types/message";
import { ApprovalResponseRequestSchema, UnlockPopupResponseRequestSchema } from "../../../types/message/zod";

// Note : i am keeping 2 methods here for opening approval popups and getting back the response, method 1 and 2 are below

// Method 1: using promise and message listener (okayies can be messy)
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

// Method 2: using ApprovalManager and discriminated union for type safety (good)
// the approval mannager stores a map or dictionary of approval requests with their id as the key, and the request data and the resolve and reject functions of the promise as the value, 
// when we create an approval request, we pass a unique id for it, and store the request data and the resolve and reject functions in the map
// then we open the popup and pass the id in the url, when we get the response from the popup, we use the id to get the corresponding request data and resolve or reject the promise accordingly,
//  this way we can have multiple approval requests at the same time without them interfering with each other, and we can also have type safety by using discriminated unions for the request data and response data. the only downside is that we need to manage the approval requests in the map and make sure to clean them up properly to avoid memory leaks, but overall it's a more robust and scalable solution compared to method 1.
export async function openSignAndSendPopup(
  payload: MessageRequest<"POPUP_SIGN_AND_SEND_TRANSACTION">["payload"]
): Promise<ApprovalManagerResponse["APPROVAL_SIGN_AND_SEND_TRANSACTION"]> {
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"APPROVAL_SIGN_AND_SEND_TRANSACTION"> = {
    id,
    type: "APPROVAL_SIGN_AND_SEND_TRANSACTION",
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

export async function openSignTransactionPopup(
  payload: MessageRequest<"POPUP_SIGN_TRANSACTION">["payload"]
): Promise<ApprovalManagerResponse["APPROVAL_SIGN_TRANSACTION"]> {
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"APPROVAL_SIGN_TRANSACTION"> = {
    id,
    type: "APPROVAL_SIGN_TRANSACTION",
    origin: payload.metadata.origin,
    icon: payload.metadata.favicon,
    payload: payload.params
  }

  const approvalPromise = ApprovalManager.createApproval(request);

  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/sign-transaction-approval?id=" + id),
    type: "popup",
    width: 400,
    height: 600,
  });

  if (popupWindow && popupWindow.id) {
    ApprovalManager.handleWindowClosed(popupWindow.id, id);
  }

  return approvalPromise
}

export async function openSignAllTransactionsPopup(
  payload: MessageRequest<"POPUP_SIGN_ALL_TRANSACTIONS">["payload"]
): Promise<ApprovalManagerResponse["APPROVAL_SIGN_ALL_TRANSACTIONS"]> {
  console.log('Opening sign all transactions popup with payload:', payload);
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"APPROVAL_SIGN_ALL_TRANSACTIONS"> = {
    id,
    type: "APPROVAL_SIGN_ALL_TRANSACTIONS",
    origin: payload.metadata.origin,
    icon: payload.metadata.favicon,
    payload: payload.params
  }

  const approvalPromise = ApprovalManager.createApproval(request);

  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/sign-all-transactions-approval?id=" + id),
    type: "popup",
    width: 400,
    height: 600,
  });

  if (popupWindow && popupWindow.id) {
    ApprovalManager.handleWindowClosed(popupWindow.id, id);
  }

  return approvalPromise
}

export async function openSignMessagePopup(
  payload: MessageRequest<"POPUP_SIGN_MESSAGE">["payload"]
): Promise<ApprovalManagerResponse["APPROVAL_SIGN_MESSAGE"]> {
  console.log('Opening sign message popup with payload:', payload);
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"APPROVAL_SIGN_MESSAGE"> = {
    id,
    type: "APPROVAL_SIGN_MESSAGE",
    origin: payload.metadata.origin,
    icon: payload.metadata.favicon,
    payload: payload.params
  }

  const approvalPromise = ApprovalManager.createApproval(request);

  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/sign-message-approval?id=" + id),
    type: "popup",
    width: 400,
    height: 600,
  });

  if (popupWindow && popupWindow.id) {
    ApprovalManager.handleWindowClosed(popupWindow.id, id);
  }

  return approvalPromise
}

export async function openSignInPopup(
  payload: MessageRequest<"POPUP_SIGN_IN">["payload"]
): Promise<ApprovalManagerResponse["APPROVAL_SIGN_IN"]> {
  console.log('Opening sign message popup with payload:', payload);
  const id = crypto.randomUUID();
  const request: ApprovalRequest<"APPROVAL_SIGN_IN"> = {
    id,
    type: "APPROVAL_SIGN_IN",
    origin: payload.metadata.origin,
    icon: payload.metadata.favicon,
    payload: payload.params
  }

  const approvalPromise = ApprovalManager.createApproval(request);

  const popupWindow = await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/signin-approval?id=" + id),
    type: "popup",
    width: 400,
    height: 600,
  });

  if (popupWindow && popupWindow.id) {
    ApprovalManager.handleWindowClosed(popupWindow.id, id);
  }

  return approvalPromise
}