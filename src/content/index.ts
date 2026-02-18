// export default window.onload = () => {
//   const element = document.createElement('div');
//   element.textContent = 'Hello from content script!';
//   element.style.position = 'fixed';
//   element.style.bottom = '10px';
//   element.style.right = '10px';
//   element.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
//   element.style.color = 'white';
//   element.style.padding = '5px 10px';
//   element.style.borderRadius = '5px';
//   element.style.zIndex = '10000';

import { sendMessage } from "../lib/utils/chrome/message";

//   document.body.appendChild(element);
// }

function injectScript() {
  try {
    sendMessage("LOGGER", "Injecting script into page...").catch(console.error);
    console.log('Injecting script into page...');
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