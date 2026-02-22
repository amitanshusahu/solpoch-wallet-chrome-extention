import { sendMessage } from "../lib/utils/chrome/message";

function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', chrome.runtime.getURL('js/inject.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (e: any) {
    console.error(e);
  }
}

injectScript();

window.addEventListener("message", async (event) => {
  try {
    if (event.source !== window) return;
    if (!event.data?.type) return;
    console.log('Received message from injected script:', event.data);
    const requestId = event.data.id;
    const response = await sendMessage(event.data.type, event.data.payload);
    console.log('Response from background:', response);
    window.postMessage({
      id: requestId,
      response
    }, "*");
  } catch (error) {
    console.log('Error handling message from injected script:', error);
    window.postMessage({
      id: event.data?.id,
      response: { success: false, error: (error as Error).message }
    }, "*");
  }
});
