import { useSearchParams } from "react-router-dom";
import SafeArea from "../ui/layout/SafeArea";
import { useEffect, useMemo, useState } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";
import { Transaction, type SimulatedTransactionResponse } from "@solana/web3.js";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";
import { lamportsToSol } from "../../lib/utils/solana/conversion";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CodeIcon,
  CpuIcon,
  CurrencyDollarIcon,
  GlobeIcon,
  InfoIcon,
  LightningIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useAccountStore } from "../../store";
import { parseProgramInteractions, parseTransferDetails, shortAddress, type ProgramInteraction, type TransferDetails } from "../../lib/utils/solana/parse";
import SimulatingOverlay from "../ui/popup/signAndSendTransaction/SimulatingOverlay";
import StatusBadge from "../ui/popup/signAndSendTransaction/StatusBadge";
import SectionCard from "../ui/popup/signAndSendTransaction/SectionCard";
import Row from "../ui/popup/signAndSendTransaction/Row";
import {
  TransactionDebuggerEngine,
  type ParsedInstructionNode,
} from "../../lib/utils/solana/transactionDebugger";
import Collapsible from "../ui/layout/Collapsible";
import AiCrad from "../ui/layout/AiCrad";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_ROUTES } from "../../lib/http/api";
import { RpcService } from "../../lib/rpc";

export default function SignAllTransactionsApproval() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [password, setPassword] = useState("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const [txs, setTxs] = useState<number[][] | null>(null);
  const [parsedTxs, setParsedTxs] = useState<Transaction[]>([]);
  const [transfersList, setTransfersList] = useState<TransferDetails[][]>([]);
  const [programsList, setProgramsList] = useState<ProgramInteraction[][]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const account = useAccountStore((state) => state.account);
  const [simulating, setSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<(SimulatedTransactionResponse | null)[]>([]);
  const [selectedTxIndex, setSelectedTxIndex] = useState(0);

  // get approval from approval manager using id
  useEffect(() => {
    async function getApproval() {
      if (!id) return;
      try {
        const approval = await sendMessage("GET_APPROVALS_FROM_MANAGER", {
          id,
          type: "APPROVAL_SIGN_ALL_TRANSACTIONS",
        });
        if (approval?.type === "APPROVAL_SIGN_ALL_TRANSACTIONS") {
          const parsed = approval.payload.transactions.map((tx) => Transaction.from(tx));
          setTxs(approval.payload.transactions);
          setParsedTxs(parsed);
          setTransfersList(parsed.map((tx) => parseTransferDetails(tx)));
          setProgramsList(parsed.map((tx) => parseProgramInteractions(tx)));
          setOrigin(approval.origin ?? "");
          setLogoUrl(approval.icon ?? "/logo.png");
        }
      } catch (error) {
        console.error("Failed to get approval:", error);
      }
    }
    if (!txs) getApproval();
  }, [id]);

  // simulate once password confirmed
  useEffect(() => {
    async function simulateTxs() {
      if (!txs) return;
      setSimulating(true);
      try {
        const response = await sendMessage("SIMULATE_USING_TRANSACTIONS", {
          transactions: txs,
          password,
        });
        // response is SimulatedTransactionResponse[] — one per transaction
        setSimulationResults(response ?? txs.map(() => null));
      } catch (error) {
        console.error("Failed to simulate transactions:", error);
        setSimulationResults(txs.map(() => null));
      } finally {
        setSimulating(false);
      }
    }
    if (txs && confimedWithPassword) simulateTxs();
  }, [txs, confimedWithPassword]);


  const handleApprove = async () => {
    if (!txs) return;
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_ALL_TRANSACTIONS", {
      id: id!,
      approved: true,
      txs,
      password,
    });
    window.close();
  };

  const handleReject = async () => {
    if (!txs) return;
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_ALL_TRANSACTIONS", {
      id: id!,
      approved: false,
      txs,
      password,
    });
    window.close();
  };
  const txCount = parsedTxs.length;
  const simulationResult = simulationResults[selectedTxIndex] ?? null;
  const parsedTx = parsedTxs[selectedTxIndex] ?? null;
  const transfers = transfersList[selectedTxIndex] ?? [];
  const programs = programsList[selectedTxIndex] ?? [];

  // Derived simulation data for selected tx
  const simErr = simulationResult?.err ?? null;
  const unitsConsumed = simulationResult?.unitsConsumed;
  const estimatedFee = parsedTx
    ? lamportsToSol(5000 * (parsedTx.signatures.length || 1))
    : null;

  const parsedInstructions = useMemo(
    () => TransactionDebuggerEngine.parseInstructions(simulationResult?.logs ?? []),
    [simulationResult?.logs]
  );

  const hasFailedBranch = (node: ParsedInstructionNode): boolean => {
    if (node.status === "failed") return true;
    return node.children.some(hasFailedBranch);
  };

  const renderInstructionNode = (node: ParsedInstructionNode, level = 0) => {
    const isFailed = node.status === "failed";
    const shouldOpenByDefault = hasFailedBranch(node);
    const statusText =
      node.status === "success" ? "success" : node.status === "failed" ? "failed" : "in progress";

    return (
      <Collapsible
        key={node.id}
        defaultOpen={shouldOpenByDefault}
        className="w-full"
        headerClassName="px-2 py-1.5"
        contentClassName="mt-1.5 flex flex-col gap-1"
        title={
          <div className="flex items-center justify-between gap-2" style={{ paddingLeft: `${level * 10}px` }}>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${isFailed ? "bg-red-400" : "bg-green-400"}`}
              />
              <p className="text-xs text-gray-200 truncate">
                {TransactionDebuggerEngine.getInstructionLabel(node)}
              </p>
              <div className="tool-tip-wrapper text-gray-200">
                <InfoIcon size={14} className="text-gray-400" />
                <div className="tool-tip">{node.programId}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {node.computeUnitsConsumed !== undefined && (
                <span className="text-[10px] text-gray-500 font-mono">
                  {node.computeUnitsConsumed.toLocaleString()} CU
                </span>
              )}
              <span
                className={`text-[10px] uppercase tracking-wide ${isFailed ? "text-red-300" : "text-green-300"}`}
              >
                {statusText}
              </span>
            </div>
          </div>
        }
      >
        <div style={{ paddingLeft: `${(level + 1) * 10}px` }}>
          {node.events.map((event, index) => (
            <p key={`${node.id}-${event.type}-${index}`} className="text-[11px] font-mono text-gray-500 break-all">
              - {event.message}
            </p>
          ))}
          {node.children.map((child) => renderInstructionNode(child, level + 1))}
        </div>
      </Collapsible>
    );
  };

  // Balance change from transfers where current wallet is involved
  const myKey = account?.pubkey ?? "";
  const netLamports = transfers.reduce((acc, t) => {
    if (t.from === myKey) return acc - t.amount;
    if (t.to === myKey) return acc + t.amount;
    return acc;
  }, 0);
  const hasBalanceChange = transfers.length > 0;

  // Any simulation error across all txs blocks approve
  const anySimErr = simulationResults.some((r) => r?.err ?? false);

  const { data: aiExplanation, isLoading: isAiExplanationLoading, isError: isAiExplanationError } = useQuery({
    queryKey: ["approvalAiExplanation", id, selectedTxIndex, simErr],
    queryFn: async () => {
      if (!simErr) return null;
      const senderBalance = account?.pubkey ? await RpcService.getBalance(account.pubkey) : "Unknown";
      const context = `
        Simulation error: ${JSON.stringify(simErr)},
        Request Origin: ${origin || "Unknown"},
        Sender Wallet: ${account?.pubkey ?? "Unknown"},
        Sender Balance: ${senderBalance},
        Estimated Fee: ${estimatedFee !== null ? `${estimatedFee} SOL` : "Unknown"},
        Units Consumed: ${unitsConsumed ?? "Unknown"},
        Parsed Instructions: ${JSON.stringify(parsedInstructions)},
        Transfers: ${JSON.stringify(transfers)},
        Transaction Payload: ${JSON.stringify(parsedTx)},
        Action: Sign all transactions request (wallet standard method - signAllTransactions).
      `;
      const res = await axios.post(API_ROUTES.ai.explainSimulationError, {
        results: context,
      });
      return res.data;
    },
    enabled: !!simErr,
    staleTime: 0,
    gcTime: 0,
    meta: {
      persist: false,
    },
  });

  if (!confimedWithPassword) {
    return (
      <SafeArea>
        <div className="p-6 h-full">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <ProfileAvatar account={account} accountLoading={false} />
            </div>
            <ConfirmWithPassword
              password={password}
              setPassword={setPassword}
              setConfimedWithPassword={setConfimedWithPassword}
            />
          </div>
        </div>
      </SafeArea>
    );
  }

  if (simulating) {
    return (
      <SafeArea>
        <SimulatingOverlay />
      </SafeArea>
    );
  }


  return (
    <SafeArea>
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 z-10 bg-bg/80 backdrop-blur-sm pb-6">
          <ProfileAvatar account={account} accountLoading={false} />
          <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center">
            <CodeIcon size={14} weight="bold" className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3 pb-6">

          {/* Title + origin */}
          <div>
            <div className="flex gap-4 items-center">
              <img src={logoUrl} alt="favicon" className="w-12 h-12 rounded-md bg-white/5 p-2" />
              <div>
                <h2 className="text-sm">Approve Sign All Transactions Request</h2>
                <h2 className="text-xs text-gray-300">{origin?.replace("https://", "").replace("http://", "")}</h2>
              </div>
            </div>
            {
              !simErr && (
                <div className="rounded bg-primary/20 p-4 mt-8 flex gap-2">
                  <div><InfoIcon size={12} weight="fill" className="text-primary" /></div>
                  <h3 className="text-xs">By approving, you authorize <span className="text-primary">{origin}</span> to sign {txCount} transaction{txCount !== 1 ? "s" : ""}, which may or may not be submitted to the blockchain</h3>
                </div>
              )
            }
          </div>

          {/* Transaction tabs (when multiple txs) */}
          {txCount > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {parsedTxs.map((_, i) => {
                const txSimErr = simulationResults[i]?.err ?? null;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedTxIndex(i)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedTxIndex === i
                      ? "bg-primary/70 text-white"
                      : "bg-white/8 text-gray-400 hover:bg-white/12"
                      }`}
                  >
                    Tx {i + 1}
                    {txSimErr && (
                      <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-red-400 align-middle" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Simulation status for selected tx */}
          {simulationResult && (
            <div className="flex flex-col gap-2">
              <StatusBadge err={simErr} />
              {simErr && !isAiExplanationError && (
                <AiCrad loading={isAiExplanationLoading} content={aiExplanation} />
              )}
              {simErr && isAiExplanationError && (
                <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 rounded-full px-3 py-1 w-full">
                  <span className="text-xs text-red-500/50">{typeof simErr === "string" ? simErr : JSON.stringify(simErr)}</span>
                </div>
              )}
            </div>
          )}

          {/* Transaction overview for selected tx */}
          {transfers.length > 0 && (
            <SectionCard>
              {transfers.map((t, i) => (
                <div key={i} className="px-3 py-2.5 border-b border-white/5 last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {t.from === myKey ? (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 shrink-0">
                          <ArrowUpIcon size={10} weight="bold" className="text-red-400" />
                        </span>
                      ) : (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/10 shrink-0">
                          <ArrowDownIcon size={10} weight="bold" className="text-green-400" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">
                          {t.from === myKey ? "Send to" : "Receive from"}
                        </p>
                        <p className="text-xs font-mono text-gray-200 truncate">
                          {shortAddress(t.from === myKey ? t.to : t.from)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-xs font-semibold shrink-0 ${t.from === myKey ? "text-red-400" : "text-green-400"
                        }`}
                    >
                      {t.from === myKey ? "-" : "+"}{t.amount.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL
                    </p>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}

          {/* Simulation details for selected tx */}
          {simulationResult && (
            <SectionCard>
              {hasBalanceChange && (
                <Row
                  label="Balance change"
                  icon={<CurrencyDollarIcon size={13} />}
                  value={
                    netLamports === 0
                      ? "No change"
                      : `${netLamports > 0 ? "+" : ""}${netLamports.toLocaleString(undefined, { maximumFractionDigits: 9 })} SOL`
                  }
                  accent={netLamports < 0 ? "red" : netLamports > 0 ? "green" : "neutral"}
                />
              )}
              <Row
                label="Estimated fee"
                icon={<LightningIcon size={13} />}
                value={estimatedFee !== null ? `~${estimatedFee.toFixed(6)} SOL` : "—"}
                accent="neutral"
              />
              {unitsConsumed !== undefined && (
                <Row
                  label="Compute units"
                  icon={<CpuIcon size={13} />}
                  value={unitsConsumed.toLocaleString()}
                  accent="neutral"
                />
              )}
            </SectionCard>
          )}

          {/* Program interactions for selected tx */}
          {programs.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-gray-500 px-0.5">Program interactions</p>
              <SectionCard>
                {programs.map((p) => (
                  <Row
                    key={p.programId}
                    label={p.label}
                    icon={<GlobeIcon size={13} />}
                    value={shortAddress(p.programId)}
                    mono
                    accent="neutral"
                  />
                ))}
              </SectionCard>
            </div>
          )}

          {/* Transaction debugger */}
          {parsedInstructions.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-gray-500 px-0.5">Instruction debugger</p>
              <SectionCard>
                <div className="px-2 py-2 max-h-44 overflow-y-auto scrollbar-hide">
                  {parsedInstructions.map((instruction, index) => (
                    <Collapsible
                      key={`root-${instruction.id}`}
                      defaultOpen={hasFailedBranch(instruction)}
                      className="relative"
                      headerClassName="px-2 py-1.5"
                      contentClassName="mt-1.5 flex flex-col gap-1.5"
                      title={
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 justify-center">
                            <span className="text-xs text-gray-200 truncate">
                              {TransactionDebuggerEngine.formatInstructionTitle(instruction, index)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {instruction.computeUnitsConsumed !== undefined && (
                              <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                {instruction.computeUnitsConsumed.toLocaleString()} CU
                              </span>
                            )}
                          </div>
                        </div>
                      }
                    >
                      <div className="flex flex-col gap-1.5">
                        {renderInstructionNode(instruction)}
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* Fallback raw logs */}
          {parsedInstructions.length === 0 && simulationResult?.logs && simulationResult.logs.length > 0 && (
            <Collapsible
              title={
                <div className="flex items-center justify-between gap-2 w-full text-xs text-gray-500 hover:text-gray-300 transition-colors select-none">
                  <span>View raw logs ({simulationResult.logs.length})</span>
                </div>
              }
              className="w-full"
              headerClassName="px-0 py-0"
              contentClassName="mt-2"
            >
              <div className="mt-2 rounded-xl bg-white/3 border border-white/6 p-3 max-h-32 overflow-y-auto scrollbar-hide">
                {simulationResult.logs.map((log, i) => (
                  <p key={i} className="text-xs font-mono text-gray-500 leading-5 break-all">
                    {log}
                  </p>
                ))}
              </div>
            </Collapsible>
          )}

          {/* Simulation warning if not yet done */}
          {!simulationResult && !simulating && (
            <div className="flex items-center gap-2 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20 px-3 py-2.5">
              <WarningCircleIcon size={14} className="text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-300/80">Simulation data unavailable</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-bg/80 backdrop-blur-sm pt-3">
          <button
            onClick={handleReject}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/7 hover:bg-white/11 transition-colors rounded-full text-white font-medium w-full text-xs"
          >
            <XIcon size={13} weight="bold" />
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={anySimErr}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-full text-white font-medium w-full text-xs inset-top"
          >
            <CheckIcon size={13} weight="bold" />
            Approve All
          </button>
        </div>
      </div>
    </SafeArea>
  );
}