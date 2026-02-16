export function sendMessage<T = any>(message: any): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (!response.success) {
        reject(new Error(response.error));
      } else {
        resolve(response.data);
      }
    });
  });
}
