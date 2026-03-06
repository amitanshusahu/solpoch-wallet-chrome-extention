// buildTransaction()
//    ├── simulateTransaction()
//    └── signAndSend()
//            │
//            ▼
//         vault.signTransaction()
//            │
//            ▼
//         rpcClient.broadcast()

import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { vaultService } from "../vault/service"

export class TransactionService {

  static async sendSol(to: string, amount: number, password: string) {
    const account = await vaultService.getActiveAccount()
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(account.pubkey),
        toPubkey: new PublicKey(to),
        lamports: amount
      })
    )
    const signedTx = await vaultService.signTransaction(tx, password)
    // return rpcClient.broadcast(signedTx)
  }
  
}