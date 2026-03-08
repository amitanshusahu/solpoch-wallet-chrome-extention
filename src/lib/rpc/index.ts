import { Connection, PublicKey, Transaction, VersionedTransaction, type Blockhash, type RpcResponseAndContext, type SignatureStatus, type SimulatedTransactionResponse, type SimulateTransactionConfig } from "@solana/web3.js";


const rpcEndpoints = {
  devnet: "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com",
  testnet: "https://api.testnet.solana.com",
};

const rpcConnection = new Connection(rpcEndpoints.devnet, "confirmed");

export class RpcService {
  private static getConnection(): Connection {
    return rpcConnection;
  }

  static async getBalance(publicKey: string): Promise<number> {
    const connection = this.getConnection();
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance;
  }

  static async getLatestBlockhash(): Promise<Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: number;
  }>> {
    const connection = this.getConnection();
    const latestBlockHash = await connection.getLatestBlockhash();
    return latestBlockHash;
  }

  static async sendRawTransaction(signedTx: Transaction): Promise<string> {
    const connection = this.getConnection();
    const signature = await connection.sendRawTransaction(
      signedTx.serialize(),
      { maxRetries: 3 }
    );
    return signature;
  }

  static async simulateTransaction(signedTx: Transaction, config: SimulateTransactionConfig): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    const connection = this.getConnection();
    const versionedTx = new VersionedTransaction(signedTx.compileMessage());
    const simulation = await connection.simulateTransaction(versionedTx, config);
    return simulation;
  }

  static async getBlockHeight(): Promise<number> {
    const connection = this.getConnection();
    const blockHeight = await connection.getBlockHeight();
    return blockHeight;
  }

  static async getSignatureStatuses(signatures: string[]): Promise<RpcResponseAndContext<(SignatureStatus | null)[]>> {
    const connection = this.getConnection();
    const statuses = await connection.getSignatureStatuses(signatures);
    return statuses;
  }

}