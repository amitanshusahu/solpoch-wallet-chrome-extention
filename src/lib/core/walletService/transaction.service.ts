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

    // confirm INSIDE background
    const result = await rpcConnection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    })
    console.log("Transaction result:", result)

    if (result.value.err) {
      console.error("Transaction failed", result.value.err);
      return {
        success: false,
        data: signature,
        error: JSON.stringify(result.value.err),
      }
    } else {
      console.log("Transaction confirmed", result);
      return {
        success: true,
        data: signature,
      }
    }
  }

}