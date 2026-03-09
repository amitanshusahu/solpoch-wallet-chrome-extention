import { SystemInstruction, SystemProgram, type Transaction } from "@solana/web3.js";
import { lamportsToSol } from "./solLamportConversion";

// Well-known program labels
export const PROGRAM_LABELS: Record<string, string> = {
  "11111111111111111111111111111111": "System Program",
  TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "Token Program",
  ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bsM: "Associated Token Program",
  ComputeBudget111111111111111111111111111111111: "Compute Budget",
  MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr: "Memo Program",
  Sysvar1nstructions1111111111111111111111111: "Instructions Sysvar",
};

export function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export interface TransferDetails {
  to: string;
  from: string;
  amount: number;
}

export interface ProgramInteraction {
  programId: string;
  label: string;
}

export function parseTransferDetails(tx: Transaction): TransferDetails[] {
  const transfers: TransferDetails[] = [];
  tx.instructions.forEach((ix) => {
    if (ix.programId.equals(SystemProgram.programId)) {
      try {
        const decoded = SystemInstruction.decodeTransfer(ix);
        transfers.push({
          from: decoded.fromPubkey.toBase58(),
          to: decoded.toPubkey.toBase58(),
          amount: lamportsToSol(decoded.lamports),
        });
      } catch {
        // not a transfer instruction
      }
    }
  });
  return transfers;
}

export function parseProgramInteractions(tx: Transaction): ProgramInteraction[] {
  const seen = new Set<string>();
  const programs: ProgramInteraction[] = [];
  tx.instructions.forEach((ix) => {
    const id = ix.programId.toBase58();
    if (!seen.has(id)) {
      seen.add(id);
      programs.push({
        programId: id,
        label: PROGRAM_LABELS[id] ?? shortAddress(id),
      });
    }
  });
  return programs;
}