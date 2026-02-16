import { registerWallet } from './register.ts';
import { SolpochWallet } from './wallet.ts';
import type { Solpoch } from './window.ts';

export function initialize(solpoch: Solpoch): void {
    registerWallet(new SolpochWallet(solpoch));
}
