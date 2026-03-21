import { Connection, PublicKey, Transaction, VersionedTransaction, type Blockhash, type RpcResponseAndContext, type SignatureStatus, type SimulatedTransactionResponse, type SimulateTransactionConfig, type TransactionSignature } from "@solana/web3.js";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  deserializeMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey as PublicKeyMeta } from "@metaplex-foundation/umi";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  MPL_TOKEN_METADATA_PROGRAM_ID
);

const rpcEndpoints = {
  devnet: "https://api.devnet.solana.com",
  mainnet: "https://api.mainnet-beta.solana.com",
  testnet: "https://api.testnet.solana.com",
};

const rpcConnection = new Connection(rpcEndpoints.devnet, "confirmed");

export class RpcService {
  static getConnection(): Connection {
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

  static async sendRawTransaction(signedTx: Transaction): Promise<TransactionSignature> {
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

  static async getAssociatedTokenAccountInfo(publicKey: string, mintAddress: string) {
    const connection = this.getConnection();
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(publicKey),
      { mint: new PublicKey(mintAddress) }
    );

    if (tokenAccounts.value.length === 0) {
      return null;
    }

    const info = tokenAccounts.value[0].account.data.parsed.info;

    return {
      mint: info.mint,
      balance: info.tokenAmount.uiAmount,
      decimals: info.tokenAmount.decimals,
      tokenAccount: tokenAccounts.value[0].pubkey.toBase58(),
    };
  }

  static async getMintTokenInfo(mintAddress: string) {
    const connection = this.getConnection();
    const mintPubkey = new PublicKey(mintAddress);

    try {
      // fetch mint info
      const mintInfo = await getMint(connection, mintPubkey);

      const decimals = mintInfo.decimals;
      const supply = mintInfo.supply;
      const mintAuthority = mintInfo.mintAuthority?.toBase58() || null;
      const freezeAuthority = mintInfo.freezeAuthority?.toBase58() || null;

      // derive metadata PDA
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const accountInfo = await connection.getAccountInfo(metadataPDA);

      let name = null;
      let symbol = null;
      let uri = null;
      let json: any = null;

      if (accountInfo) {
        const rpcAccount = {
          executable: accountInfo.executable,
          owner: PublicKeyMeta(accountInfo.owner.toBase58()),
          lamports: {
            basisPoints: BigInt(accountInfo.lamports),
            identifier: "SOL" as const,
            decimals: 9 as const,
          },
          data: new Uint8Array(accountInfo.data),
          publicKey: PublicKeyMeta(metadataPDA.toBase58()),
        };

        const metadata = deserializeMetadata(rpcAccount);

        name = metadata.name.replace(/\0/g, "");
        symbol = metadata.symbol.replace(/\0/g, "");
        uri = metadata.uri.replace(/\0/g, "");

        try {
          const res = await fetch(uri);
          json = await res.json();
        } catch { }
      }

      return {
        mintAddress,
        name,
        symbol,
        uri,

        image: json?.image || null,
        description: json?.description || null,

        decimals,
        supply: supply.toString(),

        mintAuthority,
        freezeAuthority,

        metadata: json
      };

    } catch (err) {
      console.error("Token fetch failed:", err);
      return null;
    }
  }

  static async getTokenList(publicKey: string) {
    const connection = this.getConnection();

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(publicKey),
      { programId: TOKEN_PROGRAM_ID }
    );

    const parsedTokens = tokenAccounts.value.map((t) => {
      const info = t.account.data.parsed.info;

      return {
        mint: info.mint,
        balance: info.tokenAmount.uiAmount,
        decimals: info.tokenAmount.decimals,
        tokenAccount: t.pubkey.toBase58(),
      };
    });

    const mints = parsedTokens.map((t) => new PublicKey(t.mint));

    // derive metadata PDAs
    const metadataPDAs = mints.map((mint) =>
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )[0]
    );

    // batch fetch metadata accounts
    const metadataAccounts = await connection.getMultipleAccountsInfo(metadataPDAs);

    const metadataResults = await Promise.all(
      metadataAccounts.map(async (account, i) => {
        if (!account) return null;

        try {
          // Construct a proper RpcAccount object instead of passing raw buffer
          const rpcAccount = {
            executable: account.executable,
            owner: PublicKeyMeta(account.owner.toBase58()),
            lamports: {
              basisPoints: BigInt(account.lamports),
              identifier: "SOL" as const,
              decimals: 9 as const,
            },
            data: new Uint8Array(account.data),
            publicKey: PublicKeyMeta(metadataPDAs[i].toBase58()),
          };

          const metadata = deserializeMetadata(rpcAccount);

          const uri = metadata.uri.replace(/\0/g, "");

          let json = null;

          try {
            const res = await fetch(uri);
            json = await res.json();
          } catch { }

          return {
            name: metadata.name.replace(/\0/g, ""),
            symbol: metadata.symbol.replace(/\0/g, ""),
            uri,
            json,
          };
        } catch {
          return null;
        }
      })
    );

    // merge token + metadata
    const result = parsedTokens.map((token, i) => ({
      ...token,
      metadata: metadataResults[i],
    }));

    return result;
  }

  static async getTransactionsForAddress(address: string) {
    const connection = this.getConnection();
    const confirmedSignatures = await connection.getSignaturesForAddress(new PublicKey(address));
    const signatures = confirmedSignatures.map((sig) => sig.signature).slice(0, 5); // limit to 5 transactions for now
    const transactions = [];

    for (let i = 0; i < signatures.length; i++) {
      const tx = await connection.getTransaction(signatures[i]);
      transactions.push(tx);

      // Throttle follow-up RPC requests when fetching multiple signatures.
      if (signatures.length > 1 && i < signatures.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log({ transactions });
    return transactions;
  };

}