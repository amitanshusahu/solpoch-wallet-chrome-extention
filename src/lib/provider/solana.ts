import {
  type IdentifierArray,
  type Wallet,
  type WalletAccount,
} from '@wallet-standard/base';

import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features';

import { PublicKey, Keypair } from '@solana/web3.js';
import { LOGO_IMAGE, WALLET_NAME } from '../constants/common';
import type { Solpoch } from '../solpoch-wallet-standard/window';

const SOLANA_MAINNET_CHAIN = 'solana:mainnet';
const CHAINS: IdentifierArray = [SOLANA_MAINNET_CHAIN];

export class ProviderSolana implements Solpoch {

  readonly url: string = 'https://www.cosmostation.io/';
  readonly version = '1.0.0';
  readonly name: string = WALLET_NAME;
  readonly icon = LOGO_IMAGE;
  readonly chains = CHAINS;
  // readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};

  private keypair = Keypair.generate();
  private listeners: Record<string, Function[]> = {};

  get accounts(): WalletAccount[] {
    return [{
      address: this.keypair.publicKey.toBase58(),
      publicKey: this.keypair.publicKey.toBytes(),
      chains: ['solana:mainnet'],
      features: ['standard:connect']
    }];
  }

  get features() {
    return {
      'standard:connect': {
        version: '1.0.0',
        connect: this.connect.bind(this)
      },
      'standard:disconnect': {
        version: '1.0.0',
        disconnect: this.disconnect.bind(this)
      },
      'standard:events': {
        version: '1.0.0',
        on: this.on.bind(this)
      }
    };
  }

  async connect() {
    this.emit('connect', { accounts: this.accounts });
    return { accounts: this.accounts };
  }

  async disconnect() {
    this.emit('disconnect', {});
  }

  on(event: string, listener: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  private emit(event: string, data: any) {
    this.listeners[event]?.forEach(fn => fn(data));
  }
}