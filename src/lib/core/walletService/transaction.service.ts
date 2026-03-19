import { PublicKey, SystemProgram, Transaction, type Commitment, type SimulateTransactionConfig } from "@solana/web3.js"
import { vaultService } from "../vault/service"
import type { MessageResponse } from "../../../types/message"
import { RpcService } from "../../rpc"
import bs58 from "bs58";
import { chains, features } from "../../utils/solana/walletFeatures";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, TokenAccountNotFoundError, TokenInvalidAccountOwnerError, TokenInvalidMintError, TokenInvalidOwnerError, type Account } from "@solana/spl-token";

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

  static async signIn(input: string, password: string): Promise<{
    account: {
      address: string,
      publicKey: number[],
      chains: typeof chains,
      features: typeof features
    },
    signedMessage: number[],
    signature: number[],
  }> {
    try {
      const signature = await vaultService.signIn(input, password);
      const pubkey = (await vaultService.getActiveAccount()).pubkey;

      return {
        account: {
          address: pubkey,
          publicKey: Array.from(bs58.decode(pubkey)),
          chains: chains,
          features: features,
        },
        signedMessage: Array.from(new TextEncoder().encode(input)),
        signature: Array.from(signature.signature)
      };
    } catch (error) {
      throw new Error(`Sign in failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async simulateTransferTokens(
    mint: string,
    destination: string,
    amount: number,
    password: string
  ) {
    try {
      const connection = RpcService.getConnection();
      const activeAccount = await vaultService.getActiveAccount();

      const mintPubkey = new PublicKey(mint);

      const myTokenAccount = getAssociatedTokenAddressSync(
        mintPubkey,
        new PublicKey(activeAccount.pubkey)
      );

      const destinationTokenAccount = getAssociatedTokenAddressSync(
        mintPubkey,
        new PublicKey(destination)
      );

      const ix = createTransferInstruction(
        myTokenAccount,
        destinationTokenAccount,
        new PublicKey(activeAccount.pubkey),
        amount
      );
      const tx = new Transaction().add(ix);
      tx.feePayer = new PublicKey(activeAccount.pubkey);
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await this.signTransaction(tx, password);
      const txArray = signedTx.serialize();
      const sim = await this.simulateTransactionUsingTransaction(Array.from(txArray), password);
      return sim;
    } catch (error) {
      console.error("Simulate transfer tokens failed:", error);
      throw new Error(`Simulate transfer tokens failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async transferTokens(
    mint: string,
    destination: string,
    amount: number,
    password: string
  ) {
    try {
      const activeAccount = await vaultService.getActiveAccount();
      const myTokenAccount = await this.getOrCreateAssociatedTokenAccount(
        new PublicKey(activeAccount.pubkey), // payer, in ata creation if not exists
        new PublicKey(mint),
        new PublicKey(activeAccount.pubkey), // owner
        password
      );
      const destinationTokenAccount = await this.getOrCreateAssociatedTokenAccount(
        new PublicKey(activeAccount.pubkey), // payer, in ata creation if not exists - we can use anyone as payer, using active account for simplicity
        new PublicKey(mint),
        new PublicKey(destination), // owner
        password
      );

      const source = myTokenAccount.address;
      const dest = destinationTokenAccount.address;
      const ownerPublicKey = new PublicKey(activeAccount.pubkey);
      const programId = TOKEN_PROGRAM_ID;
      const { blockhash, lastValidBlockHeight } = await RpcService.getLatestBlockhash()
      const transaction = new Transaction().add(
        createTransferInstruction(source, dest, ownerPublicKey, amount, [], programId),
      );
      transaction.feePayer = new PublicKey(activeAccount.pubkey);
      transaction.recentBlockhash = blockhash;

      const signedTx = await this.signTransaction(transaction, password);
      const signature = await RpcService.sendRawTransaction(signedTx);
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
    } catch (error) {
      console.error("Transfer tokens failed:", error);
      throw new Error(`Transfer tokens failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static async getOrCreateAssociatedTokenAccount(payer: PublicKey, mint: PublicKey, owner: PublicKey, password: string, commitment?: Commitment): Promise<Account> {
    const programId = TOKEN_PROGRAM_ID;
    const associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID;
    const allowOwnerOffCurve = false;
    const connection = RpcService.getConnection();
    const associatedToken = getAssociatedTokenAddressSync(
      mint,
      owner,
      allowOwnerOffCurve,
      programId,
      associatedTokenProgramId,
    );

    let account: Account;
    try {
      account = await getAccount(connection, associatedToken, commitment, programId);
    } catch (error: unknown) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        try {
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              payer,
              associatedToken,
              owner,
              mint,
              programId,
              associatedTokenProgramId,
            ),
          );

          const { blockhash, lastValidBlockHeight } = await RpcService.getLatestBlockhash()
          transaction.recentBlockhash = blockhash
          transaction.feePayer = new PublicKey(payer)

          const signedTx = await this.signTransaction(transaction, password)
          const signature = await RpcService.sendRawTransaction(signedTx)

          await this.pollForConfirmation(
            signature,
            lastValidBlockHeight
          )
        } catch (error: unknown) {
          console.error("Failed to create associated token account:", error);
        }

        account = await getAccount(connection, associatedToken, commitment, programId);
      } else {
        throw error;
      }
    }

    if (!account.mint.equals(mint)) throw new TokenInvalidMintError();
    if (!account.owner.equals(owner)) throw new TokenInvalidOwnerError();

    return account;
  }

}