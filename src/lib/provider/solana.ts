import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import type { Transaction, SendOptions, TransactionSignature } from '@solana/web3.js';
import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import type { Solpoch, SolpochEvent } from '../solpoch-wallet-standard/window.ts';


export class ProviderSolana implements Solpoch {
  private _keypair: Keypair = Keypair.generate();
  private _publicKey: PublicKey | null = null;
  private _listeners: { [E in keyof SolpochEvent]?: SolpochEvent[E][] } = {};

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  async connect(_options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: PublicKey }> {
    this._publicKey = this._keypair.publicKey;
    this._emit('connect');
    return { publicKey: this._publicKey };
  }

  async disconnect(): Promise<void> {
    this._publicKey = null;
    this._emit('disconnect');
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(
    _transaction: T,
    _options?: SendOptions
  ): Promise<{ signature: TransactionSignature }> {
    throw new Error('signAndSendTransaction is not implemented yet');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(_transaction: T): Promise<T> {
    throw new Error('signTransaction is not implemented yet');
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