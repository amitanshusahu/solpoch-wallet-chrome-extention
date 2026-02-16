/// <reference types="chrome" />

const handleOnPageClick = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  console.log('Context menu item clicked:', info, tab);
  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        alert('Hello from the context menu!');
      }
    });
  }
}

const handleOnSlectionClick = (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  console.log('Context menu item clicked:', info, tab);
  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (selectedText: string) => {
        alert(`You selected: ${selectedText}`);
      },
      args: [info.selectionText || '']
    });
  }
}


export default chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed and background script is running!');

  chrome.contextMenus.create({
    id: 'pageContext',
    title: 'Page Context Menu',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'selectionContext',
    title: 'Selection Context Menu',
    contexts: ['selection']
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'pageContext') {
      handleOnPageClick(info, tab);
    } else if (info.menuItemId === 'selectionContext') {
      handleOnSlectionClick(info, tab);
    }
  });
  
})