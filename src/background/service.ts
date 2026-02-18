import type { Vault } from "../lib/core/vault";
import { openApprovalPopup } from "../lib/utils/chrome/popups";
import type { MessageRequest, MessageResponse } from "../types/message";


export async function handleConnectWallet(
  payload: MessageRequest<"CONNECT_WALLET">["payload"],
  vault: Vault
): Promise<MessageResponse<"CONNECT_WALLET">> {
  const { origin } = payload;
  console.log(`Received CONNECT_WALLET request from origin: ${origin}`);

  const vaultExists = await vault.exists();
  if (!vaultExists) {
    throw new Error("Vault does not exist. Please create a vault first.");
  }
  const isUnlocked = await vault.getIsUnlocked();

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