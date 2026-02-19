import { vaultService } from "../lib/core/vault/service";
import { openApprovalPopup } from "../lib/utils/chrome/popups";
import type { MessageRequest, MessageResponse } from "../types/message";


export async function handleConnectWallet(
  payload: MessageRequest<"CONNECT_WALLET">["payload"],
): Promise<MessageResponse<"CONNECT_WALLET">> {
  const { origin } = payload;
  console.log(`Received CONNECT_WALLET request from origin: ${origin}`);

  const vaultExists = await vaultService.exists();
  if (!vaultExists) {
    throw new Error("Vault does not exist. Please create a vault first.");
  }
  const isUnlocked = await vaultService.getIsUnlocked();
  if (!isUnlocked) {
    throw new Error("Vault is locked. Please unlock the vault first.");
  }

  const userApproval = await openApprovalPopup(origin);

  if (!userApproval) {
    throw new Error("User rejected the connection request.");
  }

  return {
    success: true,
    data: { publicKey: "dummy_public_key" }
  };
}