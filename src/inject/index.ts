import { ProviderSolana } from "../lib/provider/solana.ts";
import { initialize } from "../lib/solpoch-wallet-standard/initialize.ts";

const solpoch = new ProviderSolana();
initialize(solpoch);

// for legacy apps relying on globals
try {
    Object.defineProperty(window, 'solpoch', { value: solpoch });
}
catch (error) {
    console.error(error);
}