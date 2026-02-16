import { ProviderSolana } from "../lib/provider/solana.ts";
import { initialize } from "../lib/solpoch-wallet-standard/initialize.ts";

// Create a reference to your wallet's existing API.
const solpoch = new ProviderSolana();

// Register your wallet using the Wallet Standard, passing the reference.
initialize(solpoch);

// New wallets no longer need to register wallet globals - and can 
// ignore the code below. However if you have legacy apps relying on globals, 
// this is the safest way to attach the reference to the window, guarding against errors.
try {
    Object.defineProperty(window, 'solpoch', { value: solpoch });
}
catch (error) {
    console.error(error);
}