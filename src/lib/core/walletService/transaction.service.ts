import { PublicKey, SystemProgram, Transaction, type SimulateTransactionConfig } from "@solana/web3.js"
import { vaultService } from "../vault/service"
import type { MessageResponse } from "../../../types/message"
import { RpcService } from "../../rpc"

export abstract class TransactionService {

  private static async buildTransaction(to: string, amount: number): Promise<{ tx: Transaction; publicKey: string }> {
    const account = await vaultService.getActiveAccount()
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(account.pubkey),
        toPubkey: new PublicKey(to),
        lamports: amount
      })
    )

    return { tx, publicKey: account.pubkey }
  }

  static async signTransaction(tx: Transaction, password: string): Promise<Transaction> {
    const signedTx = await vaultService.signTransaction(tx, password)
    return signedTx
  }

  static async simulateTransaction(
    to: string,
    amount: number,
    password: string
  ): Promise<MessageResponse<"SIMULATE_TRANSACTION">> {
    const { tx, publicKey } = await this.buildTransaction(to, amount);

    const { blockhash } = await RpcService.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = new PublicKey(publicKey)

    const signedTx = await this.signTransaction(tx, password)
    const config: SimulateTransactionConfig = { commitment: "confirmed" }
    const simulation = await RpcService.simulateTransaction(signedTx, config);

    console.log("Simulation result:", simulation)
    return {
      success: true,
      data: simulation.value,
    }
  }

  static async sendTransaction(
    to: string,
    amount: number,
    password: string
  ): Promise<MessageResponse<"SIGN_AND_SEND_TRANSACTION">> {
    const { tx, publicKey } = await this.buildTransaction(to, amount)

    const { blockhash, lastValidBlockHeight } = await RpcService.getLatestBlockhash()
    tx.recentBlockhash = blockhash
    tx.feePayer = new PublicKey(publicKey)

    const signedTx = await this.signTransaction(tx, password)
    const signature = await RpcService.sendRawTransaction(signedTx)

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
   * NOTE: for future me
    polls getSignatureStatuses() instead of confirmTransaction(), 
    which crashes in MV3 service workers because it uses window object internally
    for a websocket connection. (error window is not defined)
   **/
  // TODO: implement transaction mannager that will track a queue of pending transactions
  // in indexdb, and then a background process will do the polling and update the status of transaction in queue, so that we can show pending/confirmed/failed status in UI without relying on user to keep the tab open until transaction is confirmed.
  private static async pollForConfirmation(
    signature: string,
    lastValidBlockHeight: number,
    intervalMs = 2000
  ): Promise<{ success: boolean; error?: string }> {
    while (true) {
      const { value } = await RpcService.getSignatureStatuses([signature]);
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
      const blockHeight = await RpcService.getBlockHeight();
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

  static async signAndSendTransaction(tx: number[], password: string): Promise<string> {
    const transaction = Transaction.from(tx);
    const signedTx = await this.signTransaction(transaction, password);
    const signature = await RpcService.sendRawTransaction(signedTx);
    return signature;
  }

  static async simulateTransactionUsingTransaction(tx: number[], password: string): Promise<MessageResponse<"SIMULATE_USING_TRANSACTION">> {
    try {
      const transaction = Transaction.from(tx);
      const signedTx = await this.signTransaction(transaction, password);
      const config: SimulateTransactionConfig = { commitment: "confirmed" }
      const simulation = await RpcService.simulateTransaction(signedTx, config);

      console.log("Simulation result:", simulation)
      return {
        success: true,
        data: simulation.value,
      }
    } catch (error) {
      throw new Error(`Simulation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async signAllTransactions(txs: number[][], password: string): Promise<Transaction[]> {
    const signedTxs: Transaction[] = [];
    for (const tx of txs) {
      const transaction = Transaction.from(tx);
      const signedTx = await this.signTransaction(transaction, password);
      signedTxs.push(signedTx);
    }
    return signedTxs;
  }

  static async simulateTransactionUsingTransactions(txs: number[][], password: string): Promise<MessageResponse<"SIMULATE_USING_TRANSACTIONS">> {
    try {
      const signedTxs = await this.signAllTransactions(txs, password);
      const config: SimulateTransactionConfig = { commitment: "confirmed" }
      const simulations = [];
      for (const signedTx of signedTxs) {
        const simulation = await RpcService.simulateTransaction(signedTx, config);
        simulations.push(simulation.value);
      }

      console.log("Simulations result:", simulations)
      return {
        success: true,
        data: simulations,
      }
    } catch (error) {
      throw new Error(`Simulation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async signMessage(message: number[], password: string): Promise<{ signature: number[] }> {
    try {
      const uintMessage = new Uint8Array(message);

      const signature = await vaultService.singMessage(uintMessage, password);

      return {
        signature: Array.from(signature.signature)
      };
    } catch (error) {
      throw new Error(`Sign message failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

}