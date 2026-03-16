export function solToLamports(amount: number): number {
  return Math.round(amount * Math.pow(10, 9));
}

export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / Math.pow(10, 9);
}

export function tokensToLargestUnit(amount: number, decimals: number): number {
  return Number(Math.round(amount * Math.pow(10, decimals)));
}

export function largestUnitToTokens(amount: bigint, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}