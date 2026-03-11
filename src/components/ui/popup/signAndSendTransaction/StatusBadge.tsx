import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";
import type { SimulatedTransactionResponse } from "@solana/web3.js";

export default function StatusBadge({ err }: { err: SimulatedTransactionResponse["err"] }) {
  if (!err) {
    return (
      <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 w-full">
        <CheckCircleIcon size={12} weight="fill" className="text-green-500" />
        <span className="text-xs text-green-500">simulated transaction, it will likely succeed</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1 w-full">
      <XCircleIcon size={12} weight="fill" className="text-red-500" />
      <span className="text-xs text-red-500">simulated transaction, it will likely fail</span>
    </div>
  );
}