import { sendMessage } from "../../lib/utils/chrome/message";

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
    console.log('CONTENT: Received message from injected script:', event.data);
    const requestId = event.data.id;
    console.log('CONTENT: Handling message of type:', event.data.type, 'with requestId:', requestId);
    const response = await sendMessage(event.data.type, event.data.payload);
    console.log('CONTENT: Response from background:', response);
    window.postMessage({
      id: requestId,
      response
    }, "*");
  } catch (error) {
    console.log('CONTENT: Error handling message from injected script:', error);
    window.postMessage({
      id: event.data?.id,
      response: { success: false, error: (error as Error).message }
    }, "*");
  }
});
