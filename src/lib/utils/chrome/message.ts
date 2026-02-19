import type { MessageMap, MessageResponse } from "../../../types/message";

export function sendMessage<T extends keyof MessageMap>(
  type: T,
  payload: MessageMap[T]["req"]
): Promise<MessageMap[T]["res"]> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type, payload },
      (response: MessageResponse<T>) => {
        if (!response.success) {
          reject(response.error);
        } else {
          resolve(response.data as MessageMap[T]["res"]);
        }
      }
    );
  });
}

export function sendWindowMessage<T extends keyof MessageMap>(
  type: T,
  payload: MessageMap[T]["req"]
): Promise<MessageMap[T]["res"]> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();

    function handler(event: MessageEvent) {
      console.log('Received message event:', event);
      // Only handle response messages (ones without a `type` field) that match our request ID
      if (event.data?.id === requestId && !event.data?.type && "response" in event.data) {
        window.removeEventListener('message', handler);
        resolve(event.data.response as MessageMap[T]["res"]);
      }
    }

    // IMPORTANT: Register listener BEFORE posting to avoid any race
    window.addEventListener('message', handler);

    // send message to content script listener
    window.postMessage({
      type: type,
      id: requestId,
      payload
    }, "*");
  });
}