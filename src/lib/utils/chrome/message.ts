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
      if (event.data?.id === requestId) {
        window.removeEventListener('message', handler);
        resolve(event.data.response as MessageMap[T]["res"]);
      }
    }

    window.addEventListener('message', handler);

    window.postMessage({
      type: type,
      id: requestId,
      payload
    }, "*");
  });
}