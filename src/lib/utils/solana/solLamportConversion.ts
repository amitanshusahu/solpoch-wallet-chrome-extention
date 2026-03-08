export function solToLamports(amount: number): number {
  return Math.round(amount * Math.pow(10, 9));
}

export function lamportsToSol(lamports: number): number {
  return lamports / Math.pow(10, 9);
}