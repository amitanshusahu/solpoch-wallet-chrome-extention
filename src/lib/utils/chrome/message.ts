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
