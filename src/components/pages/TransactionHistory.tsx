import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import BackButton from "../ui/util/BackButton";
import { RpcService } from "../../lib/rpc";
import { ArrowSquareOutIcon, ClockClockwiseIcon, DotIcon } from "@phosphor-icons/react";
import type { TransactionResponse } from "@solana/web3.js";
import { lamportsToSol } from "../../lib/utils/solana/conversion";
import { useQuery } from "@tanstack/react-query";
import AddressCopyButton from "../ui/util/AddressWithCopyButton";

type ParsedTransaction = {
  signature: string;
  from: string;
  to: string;
  status: "Success" | "Failed";
  feeLamports: number;
  transferLamports: number | null;
  blockTime: number | null;
};

function formatDateTime(blockTime: number | null) {
  if (!blockTime) return "Pending";
  return new Date(blockTime * 1000).toLocaleString();
}

function accountKeyToAddress(key: unknown): string {
  if (!key) return "Unknown";

  if (typeof key === "string") return key;

  if (typeof key === "object") {
    const candidate = key as {
      toBase58?: () => string;
      pubkey?: string | { toBase58?: () => string };
    };

    if (typeof candidate.toBase58 === "function") {
      return candidate.toBase58();
    }

    if (typeof candidate.pubkey === "string") {
      return candidate.pubkey;
    }

    if (
      candidate.pubkey &&
      typeof candidate.pubkey === "object" &&
      typeof candidate.pubkey.toBase58 === "function"
    ) {
      return candidate.pubkey.toBase58();
    }
  }

  return "Unknown";
}

function parseTransaction(tx: TransactionResponse | null): ParsedTransaction | null {
  if (!tx) return null;

  const message = tx.transaction.message as {
    accountKeys?: unknown[];
    staticAccountKeys?: unknown[];
  };

  const accountKeys = message.accountKeys ?? message.staticAccountKeys ?? [];
  const from = accountKeyToAddress(accountKeys[0]);
  const to = accountKeyToAddress(accountKeys[1]);

  const signature = tx.transaction.signatures[0] ?? "Unknown";
  const status = tx.meta?.err ? "Failed" : "Success";
  const feeLamports = tx.meta?.fee ?? 0;

  const preBalances = tx.meta?.preBalances ?? [];
  const postBalances = tx.meta?.postBalances ?? [];
  const senderDelta = preBalances[0] !== undefined && postBalances[0] !== undefined
    ? preBalances[0] - postBalances[0]
    : null;
  const receiverDelta = preBalances[1] !== undefined && postBalances[1] !== undefined
    ? postBalances[1] - preBalances[1]
    : null;

  let transferLamports: number | null = null;
  if (typeof receiverDelta === "number" && receiverDelta > 0) {
    transferLamports = receiverDelta;
  } else if (typeof senderDelta === "number") {
    const estimatedTransfer = senderDelta - feeLamports;
    transferLamports = estimatedTransfer > 0 ? estimatedTransfer : null;
  }

  return {
    signature,
    from,
    to,
    status,
    feeLamports,
    transferLamports,
    blockTime: tx.blockTime ?? null,
  };
}

export default function TransactionHistory() {
  const account = useAccountStore((state) => state.account);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["transactionHistory", account?.pubkey],
    queryFn: async () => {
      if (!account) return [];
      return await RpcService.getTransactionsForAddress(account.pubkey);
    },
    enabled: Boolean(account),
  });

  const errorMessage =
    error instanceof Error ? error.message : "Unable to fetch transactions right now.";

  const parsedTransactions = (data ?? [])
    .map(parseTransaction)
    .filter((tx): tx is ParsedTransaction => tx !== null);

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm text-gray-100  flex justify-center items-center gap-1">
              <ClockClockwiseIcon size={16} weight="bold" className={`text-gray-400 ${isFetching ? "animate-spin" : ""}`} />
              Transaction History
            </h1>
            <p className="text-xs text-gray-400">Devnet</p>
          </div>

          {isLoading && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-500">Loading transactions...</p>
            </div>
          )}

          {!isLoading && isError && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4">
              <p className="text-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          {!isLoading && !isError && parsedTransactions.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-gray-500">No transactions found for this account yet.</p>
            </div>
          )}

          {!isLoading && !isError && parsedTransactions.length > 0 && (
            <div className={`flex flex-col gap-2 pb-6 ${isFetching ? "animate-pulse" : ""}`}>
              {parsedTransactions.map((tx) => {
                const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`;

                return (
                  <>
                    <div
                      className="flex justify-between items-center bg-white/5 rounded-xl border border-white/10 p-4 w-full"
                      key={tx.signature}
                    >

                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-400 flex items-center">
                          {formatDateTime(tx.blockTime)}
                          <DotIcon size={16} weight="fill" className={`${tx.status === "Success" ? "text-emerald-300" : "text-red-300"}`} />
                        </p>
                        <p className="text-xs font-semibold text-gray-300 w-fit flex gap-1">
                          <span className="text-xs text-gray-500">Sign: </span>
                          <AddressCopyButton addressToCopy={tx.signature} />
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <div className={`text-xs ${tx.to == account?.pubkey ? "text-emerald-400" : "text-red-400"}`}>
                          {tx.to == account?.pubkey ? "+" : "-"}
                          {tx.transferLamports !== null ? `${lamportsToSol(tx.transferLamports).toFixed(6)} SOL` : "N/A"}
                        </div>
                        <a
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-primary/20 text-primary px-2 py-1 text-xs font-medium"
                        >
                          <ArrowSquareOutIcon size={12} weight="bold" />
                        </a>
                      </div>

                    </div>
                  </>
                );
              })}


            </div>
          )}
        </div>
      </div>
    </SafeArea>
  );
}