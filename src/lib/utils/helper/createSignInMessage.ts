import type { SolanaSignInInput } from "@solana/wallet-standard-features";

export function createSignInMessage(input: SolanaSignInInput | undefined): string {
  if (!input) {
    return "Sign in to the application.";
  }
  const domain = input.domain || "example.com";
  const address = input.address || "Unknown Address";
  const statement = input.statement || "Sign in to the application.";
  const uri = input.uri || "https://example.com";
  const version = input.version || "1";
  const chainId = input.chainId || "1";
  const nonce = input.nonce || Math.random().toString(36).substring(2, 15);
  const issuedAt = input.issuedAt || new Date().toISOString();
  const expirationTime = input.expirationTime || new Date(Date.now() + 5 * 60 * 1000).toISOString(); // default to 5 minutes later

  return `${domain} wants you to sign in with your Solana account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}
Expiration Time: ${expirationTime}`;
}