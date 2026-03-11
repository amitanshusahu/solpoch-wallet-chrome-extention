import { vaultService } from "../vault/service";
import { openApprovalPopup, openSignAllTransactionsPopup, openSignAndSendPopup, openSignTransactionPopup, openUnlockPopup } from "../../utils/chrome/popups";
import type { MessageRequest, MessageResponse } from "../../../types/message";
import { WalletSessionService } from "./session.service";
import { TransactionService } from "./transaction.service";
import { Transaction } from "@solana/web3.js";

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
  console.log('Handling sign and send transaction request with payload:', payload);
  await commonChecks();
  const userApproval = await openSignAndSendPopup(payload);
  if (!userApproval.approved) {
    console.error('User rejected the sign and send transaction request.');
    throw new Error("User rejected the sign and send transaction request.");
  }
  const signature = await TransactionService.signAndSendTransaction(payload.params.transaction, userApproval.password);
  return {
    success: userApproval.approved,
    data: { signature }
  }
}

export async function handleSignTransaction(
  payload: MessageRequest<"POPUP_SIGN_TRANSACTION">["payload"],
): Promise<MessageResponse<"POPUP_SIGN_TRANSACTION">> {
  await commonChecks();
  const userApproval = await openSignTransactionPopup(payload);
  if (!userApproval.approved) {
    console.error('User rejected the sign transaction request.');
    throw new Error("User rejected the sign transaction request.");
  }
  const tx = Transaction.from(payload.params.transaction);
  const signedTx = await TransactionService.signTransaction(tx, userApproval.password);
  const serializeTx = signedTx.serialize({
    requireAllSignatures: false,
    verifySignatures: false
  });
  return {
    success: userApproval.approved,
    data: { transaction: Array.from(serializeTx) }
  }
}

export async function handleSignAllTransactions(
  payload: MessageRequest<"POPUP_SIGN_ALL_TRANSACTIONS">["payload"],
): Promise<MessageResponse<"POPUP_SIGN_ALL_TRANSACTIONS">> {
  await commonChecks();
  const userApproval = await openSignAllTransactionsPopup(payload);
  if (!userApproval.approved) {
    console.error('User rejected the sign transactions request.');
    throw new Error("User rejected the sign transactions request.");
  }
  const signedTx = await TransactionService.signAllTransactions(payload.params.transactions, userApproval.password);
  const serializeTx = signedTx.map((tx) => {
    return tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });
  })
  return {
    success: userApproval.approved,
    data: { transactions: serializeTx.map((tx) => Array.from(tx)) }
  }
}