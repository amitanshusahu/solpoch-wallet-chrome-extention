import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import { Transaction, type SendOptions, type TransactionSignature } from '@solana/web3.js';
import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import type { Solpoch, SolpochEvent } from '../solpoch-wallet-standard/window.ts';
import { sendWindowMessage } from '../utils/chrome/message.ts';
import { getLogoUrl } from '../utils/dom/getLogoUrl.ts';


export class ProviderSolana implements Solpoch {
  private _publicKey: PublicKey | null = null;
  private _listeners: { [E in keyof SolpochEvent]?: SolpochEvent[E][] } = {};

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  async connect(_options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    try {
      const logoUrl = getLogoUrl();
      const response = await sendWindowMessage('CONNECT_WALLET', { origin: window.location.origin, logoUrl });
      this._publicKey = new PublicKey(response.publicKey);
      this._emit('connect');
      return { publicKey: this._publicKey };
    } catch (error) {
      console.error('Failed to connect to Solpoch Wallet:', error);
      this._publicKey = null;
      this._emit('disconnect');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._emit('disconnect');
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    _transaction: T,
    _options?: SendOptions
  ): Promise<{ signature: TransactionSignature }> {
    try {
      const logoUrl = getLogoUrl();
      // NOTE: for future me
      // we are serializing the transaction here because we cannot send the Transaction object directly through postMessage, as it contains methods and stuff which can't be copied. 
      // By serializing it to an array of bytes, we can send it through postMessage and then reconstruct(deserialize) the Transaction object in the background script before signing and sending it.
      const serializedTx = _transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const payload = {
        metadata: {
          origin: window.location.origin,
          favicon: logoUrl
        },
        params: {
          transaction: Array.from(serializedTx),
          options: _options
        }
      };
      console.log('Sending signAndSendTransaction message with payload:', payload);
      const response = await sendWindowMessage("POPUP_SIGN_AND_SEND_TRANSACTION", payload);
      console.log('Received response for signAndSendTransaction:', response);
      return {
        signature: response.signature
      };
    } catch (error) {
      throw new Error('signAndSendTransaction error: ' + error);
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(_transaction: T): Promise<T> {
    try {
      const logoUrl = getLogoUrl();
      const serializedTx = _transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false
      });
      const payload = {
        metadata: {
          origin: window.location.origin,
          favicon: logoUrl
        },
        params: {
          transaction: Array.from(serializedTx),
        }
      };
      const response = await sendWindowMessage("POPUP_SIGN_TRANSACTION", payload);
      const signedTx = Transaction.from(response.transaction);
      return signedTx as T;
    } catch (error) {
      throw new Error('signTransaction is not implemented yet');
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(_transactions: T[]): Promise<T[]> {
    throw new Error('signAllTransactions is not implemented yet');
  }

  async signMessage(_message: Uint8Array): Promise<{ signature: Uint8Array }> {
    throw new Error('signMessage is not implemented yet');
  }

  async signIn(_input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
    throw new Error('signIn is not implemented yet');
  }

  // --------------- event emitter ---------------
  on<E extends keyof SolpochEvent>(event: E, listener: SolpochEvent[E], _context?: any): void {
    (this._listeners[event] ||= [] as any).push(listener);
  }

  off<E extends keyof SolpochEvent>(event: E, listener: SolpochEvent[E], _context?: any): void {
    const list = this._listeners[event];
    if (list) {
      this._listeners[event] = list.filter((l) => l !== listener) as any;
    }
  }

  private _emit<E extends keyof SolpochEvent>(event: E, ...args: Parameters<SolpochEvent[E]>): void {
    this._listeners[event]?.forEach((fn) => (fn as Function).apply(null, args));
  }
}