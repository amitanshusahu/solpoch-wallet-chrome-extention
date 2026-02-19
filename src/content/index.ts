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
  if (event.source !== window) return;
  if (!event.data?.type) return;
  const requestId = event.data.id;

  const response = await sendMessage(event.data.type, event.data.payload);

  window.postMessage({
    id: requestId,
    response
  }, "*");
});
