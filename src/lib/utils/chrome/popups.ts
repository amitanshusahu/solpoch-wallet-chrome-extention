export async function openApprovalPopup(origin: string): Promise<boolean> {

  await chrome.windows.create({
    url: chrome.runtime.getURL("index.html#/connect?origin=" + origin),
    type: "popup",
    width: 400,
    height: 600,
  });

  return true;
}