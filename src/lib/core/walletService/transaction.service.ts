// buildTransaction()
//    ├── simulateTransaction()
//    └── signAndSend()
//            │
//            ▼
//         vault.signTransaction()
//            │
//            ▼
//         rpcClient.broadcast()

import { PublicKey, SystemProgram, Transaction, VersionedTransaction, type SimulateTransactionConfig } from "@solana/web3.js"
import { vaultService } from "../vault/service"
import type { MessageResponse } from "../../../types/message"
import { rpcConnection } from "../../rpc"

// methods i would need to work
// simulateTransaction(tx)
// signTransaction(tx)
// signAllTransactions(tx[])
// sendTransaction(tx)

export class TransactionService {

  static async simulateTransaction(
    to: string,
    amount: number,
    password: string
  ): Promise<MessageResponse<"SIMULATE_TRANSACTION">> {
    const account = await vaultService.getActiveAccount()
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(account.pubkey),
        toPubkey: new PublicKey(to),
        lamports: amount
      })
    )

    const { blockhash } = await rpcConnection.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = new PublicKey(account.pubkey)

    const signedTx = await vaultService.signTransaction(tx, password)
    const versionedTx = new VersionedTransaction(signedTx.compileMessage())
    const config: SimulateTransactionConfig = { commitment: "confirmed" }
    const simulation = await rpcConnection.simulateTransaction(versionedTx, config);
    console.log("Simulation result:", simulation)
    return {
      success: true,
      data: simulation.value
    }
  }

  static async sendSol(
    to: string,
    amount: number,
    password: string
  ): Promise<MessageResponse<"SIGN_AND_SEND_TRANSACTION">> {
    const account = await vaultService.getActiveAccount()
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(account.pubkey),
        toPubkey: new PublicKey(to),
        lamports: amount
      })
    )

    const { blockhash, lastValidBlockHeight } = await rpcConnection.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = new PublicKey(account.pubkey)

    const signedTx = await vaultService.signTransaction(tx, password)

    const signature = await rpcConnection.sendRawTransaction(
      signedTx.serialize(),
      {
        maxRetries: 3
      }
    )

    // Poll for confirmation instead of using confirmTransaction()
    // because confirmTransaction() uses WebSockets internally and
    // `window` is not available in Chrome extension service workers (MV3).
    const confirmed = await this.pollForConfirmation(
      signature,
      lastValidBlockHeight
    )

    if (!confirmed.success) {
      console.error("Transaction failed or expired", confirmed.error);
      return {
        success: false,
        data: signature,
        error: confirmed.error ?? "Transaction confirmation failed",
      }
    } else {
      console.log("Transaction confirmed", signature);
      return {
        success: true,
        data: signature,
      }
    }
  }

  /**
   * Polls getSignatureStatuses() over HTTP instead of using WebSocket-based
   * confirmTransaction(), which crashes in MV3 service workers because
   * `window` is not defined.
   */
  private static async pollForConfirmation(
    signature: string,
    lastValidBlockHeight: number,
    intervalMs = 2000
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value } = await rpcConnection.getSignatureStatuses([signature]);
      const status = value?.[0];

      if (status) {
        if (status.err) {
          return { success: false, error: JSON.stringify(status.err) };
        }
        // Consider "confirmed" or "finalized" as success
        if (
          status.confirmationStatus === "confirmed" ||
          status.confirmationStatus === "finalized"
        ) {
          return { success: true };
        }
      }

      // Check if the blockhash has expired
      const blockHeight = await rpcConnection.getBlockHeight();
      if (blockHeight > lastValidBlockHeight) {
        return {
          success: false,
          error: "Transaction expired: block height exceeded lastValidBlockHeight",
        };
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

}