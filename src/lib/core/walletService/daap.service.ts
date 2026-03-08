import { vaultService } from "../vault/service";
import { openApprovalPopup, openSignAndSendPopup, openUnlockPopup } from "../../utils/chrome/popups";
import type { MessageRequest, MessageResponse } from "../../../types/message";
import { WalletSessionService } from "./session.service";

async function commonChecks() {
  const vaultExists = await vaultService.exists();
  if (!vaultExists) {
    console.error("No vault found. Rejecting connection request.");
    throw new Error("Vault does not exist. Please create a vault first.");
  }
  const isUnlocked = await WalletSessionService.getUnlocked();
  if (!isUnlocked) {
    const userUnlocked = await openUnlockPopup();
    if (!userUnlocked) {
      console.error("User failed to unlock the vault. Rejecting connection request.");
      throw new Error("Vault is locked. Please unlock the vault to connect.");
    }
  }
}

export async function handleConnectWallet(
  payload: MessageRequest<"CONNECT_WALLET">["payload"],
): Promise<MessageResponse<"CONNECT_WALLET">> {
  const { origin, logoUrl } = payload;
  await commonChecks();
  const userApproval = await openApprovalPopup(origin, logoUrl);
  if (!userApproval) {
    console.error(`User rejected the connection request from origin: ${origin}`);
    throw new Error("User rejected the connection request.");
  }
  const account = await vaultService.getActiveAccount();
  return {
    success: true,
    data: { publicKey: account.pubkey }
  };
}

export async function handleSignAndSendTransaction(
  payload: MessageRequest<"POPUP_SIGN_AND_SEND_TRANSACTION">["payload"],
): Promise<MessageResponse<"POPUP_SIGN_AND_SEND_TRANSACTION">> {
  await commonChecks();
  const userApproval = await openSignAndSendPopup(payload);
  return {
    success: userApproval,
    data: { signature: "signature" }
  }
}