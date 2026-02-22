import { vaultService } from "../lib/core/vault/service";
import { openApprovalPopup, openUnlockPopup } from "../lib/utils/chrome/popups";
import type { MessageRequest, MessageResponse } from "../types/message";


export async function handleConnectWallet(
  payload: MessageRequest<"CONNECT_WALLET">["payload"],
): Promise<MessageResponse<"CONNECT_WALLET">> {
  const { origin } = payload;
  console.log(`Received CONNECT_WALLET request from origin: ${origin}`);

  const vaultExists = await vaultService.exists();
  if (!vaultExists) {
    console.error("No vault found. Rejecting connection request.");
    throw new Error("Vault does not exist. Please create a vault first.");
  }
  const isUnlocked = await vaultService.getIsUnlocked();
  if (!isUnlocked) {
    const userUnlocked = await openUnlockPopup();
    if (!userUnlocked) {
      console.error("User failed to unlock the vault. Rejecting connection request.");
      throw new Error("Vault is locked. Please unlock the vault to connect.");
    }
  }

  const userApproval = await openApprovalPopup(origin);

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