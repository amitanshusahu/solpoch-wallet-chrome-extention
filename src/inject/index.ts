import { ProviderSolana } from "../lib/provider/solana.ts";
import { initialize } from "../lib/solpoch-wallet-standard/initialize.ts";

// Create a reference to your wallet's existing API.
const solpoch = new ProviderSolana();

// Register your wallet using the Wallet Standard, passing the reference.
initialize(solpoch);

// for legacy apps relying on globals
try {
    Object.defineProperty(window, 'solpoch', { value: solpoch });
}
catch (error) {
    console.error(error);
}