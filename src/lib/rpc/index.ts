import { Connection, PublicKey } from "@solana/web3.js";

export const rpcConnection = new Connection("https://api.devnet.solana.com");

export const rpcEndpoints = {
  devnet: "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com",
  testnet: "https://api.testnet.solana.com",
};

export class RpcService {
  static getConnection(): Connection {
    return rpcConnection;
  }

  static async getBalance(publicKey: string): Promise<number> {
    const connection = this.getConnection();
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance;
  }
}