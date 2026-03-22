export function clearClipboardAfterDelay(text?: string, delay: number = 15) {
  chrome.alarms.create("clearClipboard", { delayInMinutes: delay / 60 });

  function clearClipboard() {
    const textToWrite = text || "";
    navigator.clipboard.writeText(textToWrite);
  }

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "clearClipboard") {
      clearClipboard();
      chrome.alarms.clear("clearClipboard");
    }
  });
}