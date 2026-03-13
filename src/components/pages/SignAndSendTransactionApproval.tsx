import { useSearchParams } from "react-router-dom";
import SafeArea from "../ui/layout/SafeArea";
import { useEffect, useState } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";
import { Transaction, type SimulatedTransactionResponse } from "@solana/web3.js";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";
import { lamportsToSol } from "../../lib/utils/solana/solLamportConversion";
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
  TerminalWindowIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useAccountStore } from "../../store";
import { parseProgramInteractions, parseTransferDetails, shortAddress, type ProgramInteraction, type TransferDetails } from "../../lib/utils/solana/parse";
import SimulatingOverlay from "../ui/popup/signAndSendTransaction/SimulatingOverlay";
import StatusBadge from "../ui/popup/signAndSendTransaction/StatusBadge";
import SectionCard from "../ui/popup/signAndSendTransaction/SectionCard";
import Row from "../ui/popup/signAndSendTransaction/Row";

export default function SignAndSendTransactionApproval() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [password, setPassword] = useState("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const [tx, setTx] = useState<number[] | null>(null);
  const [parsedTx, setParsedTx] = useState<Transaction | null>(null);
  const [transfers, setTransfers] = useState<TransferDetails[]>([]);
  const [programs, setPrograms] = useState<ProgramInteraction[]>([]);
  const [origin, setOrigin] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const account = useAccountStore((state) => state.account);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulatedTransactionResponse | null>(null);

  // get approval from approval manager using id
  useEffect(() => {
    async function getApproval() {
      if (!id) return;
      try {
        const approval = await sendMessage("GET_APPROVALS_FROM_MANAGER", {
          id,
          type: "APPROVAL_SIGN_AND_SEND_TRANSACTION",
        });
        if (approval?.type === "APPROVAL_SIGN_AND_SEND_TRANSACTION") {
          const transaction = Transaction.from(approval.payload.transaction);
          setTx(approval.payload.transaction);
          setParsedTx(transaction);
          setTransfers(parseTransferDetails(transaction));
          setPrograms(parseProgramInteractions(transaction));
          setOrigin(approval.origin ?? "");
          setLogoUrl(approval.icon ?? "/logo.png");
        }
      } catch (error) {
        console.error("Failed to get approval:", error);
      }
    }
    if (!tx) getApproval();
  }, [id]);

  // simulate once password confirmed
  useEffect(() => {
    async function simulateTx() {
      if (!tx) return;
      setSimulating(true);
      try {
        const response = await sendMessage("SIMULATE_USING_TRANSACTION", {
          transaction: tx,
          password,
        });
        setSimulationResult(response);
      } catch (error) {
        console.error("Failed to simulate transaction:", error);
      } finally {
        setSimulating(false);
      }
    }
    if (tx && confimedWithPassword) simulateTx();
  }, [tx, confimedWithPassword]);


  const handleApprove = async () => {
    if (!tx) return;
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_AND_SEND_TRANSACTION", {
      id: id!,
      approved: true,
      tx,
      password,
    });
    window.close();
  };

  const handleReject = async () => {
    if (!tx) return;
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_AND_SEND_TRANSACTION", {
      id: id!,
      approved: false,
      tx,
      password,
    });
    window.close();
  };


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


  // Derived simulation data
  const simErr = simulationResult?.err ?? null;
  const unitsConsumed = simulationResult?.unitsConsumed;
  const estimatedFee = parsedTx
    ? lamportsToSol(5000 * (parsedTx.signatures.length || 1))
    : null;

  // Balance change from transfers where current wallet is involved
  const myKey = account?.pubkey ?? "";
  const netLamports = transfers.reduce((acc, t) => {
    if (t.from === myKey) return acc - t.amount;
    if (t.to === myKey) return acc + t.amount;
    return acc;
  }, 0);
  const hasBalanceChange = transfers.length > 0;


  return (
    <SafeArea>
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
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
                <h2 className="text-sm">Approve Send Transaction Request</h2>
                <h2 className="text-xs text-gray-300">{origin?.replace("https://", "").replace("http://", "")}</h2>
              </div>
            </div>
            <div className="rounded bg-primary/20 p-4 mt-8 flex gap-2">
              <div><InfoIcon size={12} weight="fill" className="text-primary" /></div>
              <h3 className="text-xs">By approving, you authorize <span className="text-primary">{origin}</span> to sign and submit this transaction to the blockchain</h3>
            </div>
          </div>

          {/* Simulation status */}
          {simulationResult && (
            <div className="flex flex-col gap-2">
              <StatusBadge err={simErr} />
              {simErr && (
                <div className="flex items-center gap-1.5 bg-red-500/5 border border-red-500/10 rounded-full px-3 py-1 w-full">
                  <TerminalWindowIcon size={12} weight="fill" className="text-red-500/50" />
                  <span className="text-xs text-red-500/50">{typeof simErr === "string" ? simErr : JSON.stringify(simErr)}</span>
                </div>
              )}
            </div>
          )}

          {/* Transaction overview */}
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

          {/* Simulation details */}
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

          {/* Program interactions */}
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

          {/* Simulation logs (collapsed) */}
          {simulationResult?.logs && simulationResult.logs.length > 0 && (
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer list-none">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors select-none">
                  <CodeIcon size={12} />
                  <span>View logs ({simulationResult.logs.length})</span>
                </div>
              </summary>
              <div className="mt-2 rounded-xl bg-white/3 border border-white/6 p-3 max-h-32 overflow-y-auto scrollbar-hide">
                {simulationResult.logs.map((log, i) => (
                  <p key={i} className="text-xs font-mono text-gray-500 leading-5 break-all">
                    {log}
                  </p>
                ))}
              </div>
            </details>
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
            disabled={simErr !== null}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-full text-white font-medium w-full text-xs inset-top"
          >
            <CheckIcon size={13} weight="bold" />
            Approve
          </button>
        </div>
      </div>
    </SafeArea>
  );
}