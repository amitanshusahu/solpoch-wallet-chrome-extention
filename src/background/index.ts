/// <reference types="chrome" />

export default chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed and background script is running!');
  
  
})