import {
  ArrowUpIcon,
  CheckIcon,
  CheckCircleIcon,
  CpuIcon,
  CurrencyDollarIcon,
  GlobeIcon,
  InfoIcon,
  LightningIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { SimulatedTransactionResponse } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { sendMessage } from "../../../lib/utils/chrome/message";
import ConfirmWithPassword from "../util/ConfirmWithPassword";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { lamportsToSol, tokensToLargestUnit } from "../../../lib/utils/solana/conversion";
import {
  TransactionDebuggerEngine,
  type ParsedInstructionNode,
} from "../../../lib/utils/solana/transactionDebugger";
import SimulatingOverlay from "../popup/signAndSendTransaction/SimulatingOverlay";
import StatusBadge from "../popup/signAndSendTransaction/StatusBadge";
import SectionCard from "../popup/signAndSendTransaction/SectionCard";
import Row from "../popup/signAndSendTransaction/Row";
import { shortAddress } from "../../../lib/utils/solana/parse";
import { useAccountStore } from "../../../store";
import { AccountBookService } from "../../../lib/core/walletService/accountBook.service";
import AiCrad from "../layout/AiCrad";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_ROUTES } from "../../../lib/http/api";
import { RpcService } from "../../../lib/rpc";
import Collapsible from "../layout/Collapsible";

// TODO: make this check logic better.. real check that if destination doesn't have a ata.
function canProceedWithAtaCreation(simulation: SimulatedTransactionResponse | null) {
  if (!simulation) return false;

  const errText = simulation.err ? JSON.stringify(simulation.err) : "";
  const logsText = simulation.logs?.join(" ") ?? "";
  const combined = `${errText} ${logsText}`.toLowerCase();

  const mentionsAta =
    combined.includes("associated token account") ||
    combined.includes(" ata ") ||
    combined.includes("ata for");
  const mentionsMissing =
    combined.includes("not present") ||
    combined.includes("does not have") ||
    combined.includes("missing") ||
    combined.includes("not found") ||
    combined.includes("invalid account data");

  return mentionsAta && mentionsMissing;
}

export default function ConfirmSendSplToken({
  amount,
  toAddress,
}: {
  amount: string;
  toAddress: string;
}) {
  const param = useParams();
  const [searchParams] = useSearchParams();
  // const tokenName = searchParams.get("name");
  const tokenLogo = searchParams.get("logo");
  const tokenSymbol = searchParams.get("symbol");
  const tokenDecimals = searchParams.get("decimals");
  const mintAddressBase58 = param.mint;

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulatedTransactionResponse | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const navigate = useNavigate();
  const [canSend, setCanSend] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const account = useAccountStore((state) => state.account);
  const simErr = simulationResult?.err ?? null;
  const unitsConsumed = simulationResult?.unitsConsumed;
  const estimatedFee = lamportsToSol(5000);

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
                <div className="tool-tip">
                  {node.programId}
                </div>
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

  useEffect(() => {
    async function simulate() {
      if (!mintAddressBase58 || !toAddress || !amount || !password) {
        setCanSend(false);
        return;
      }
      setSimulating(true);
      try {
        const response = await sendMessage("SIMULATE_TOKEN_TRANSACTION", {
          mint: mintAddressBase58,
          destination: toAddress,
          amount: tokensToLargestUnit(parseFloat(amount), parseInt(tokenDecimals || "0")),
          password,
        });
        setSimulationResult(response);
        setCanSend(!response?.err || canProceedWithAtaCreation(response));
      } catch (error) {
        console.error("Simulation error:", error);
        setCanSend(true);
      } finally {
        setSimulating(false);
      }
    }
    if (confimedWithPassword) {
      simulate();
    }
  }, [toAddress, amount, confimedWithPassword]);

  const handleSend = async () => {
    if (!mintAddressBase58 || !toAddress || !amount || !password) {
      setCanSend(false);
      return;
    }
    setCanSend(false);
    setIsSending(true);
    if (password.length === 0) {
      setConfimedWithPassword(false);
      setIsSending(false);
      return;
    }
    try {
      const response = await sendMessage("SIGN_AND_SEND_TOKEN_TRANSACTION", {
        mint: mintAddressBase58,
        destination: toAddress,
        amount: tokensToLargestUnit(parseFloat(amount), parseInt(tokenDecimals || "0")),
        password,
      });
      setSignature(response);
      const dateTime = new Date().toLocaleString();
      await AccountBookService.add({ name: `${dateTime}`, address: toAddress });
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const { data: aiExplanation, isLoading: isAiExplanationLoading, isError: isAiExplanationError } = useQuery({
    queryKey: ["aiTokenExplanation", simErr],
    queryFn: async () => {
      if (!simErr) return null;
      const senderBalance = account?.pubkey ? await RpcService.getBalance(account.pubkey) : "Unknown";
      const context = `
        Simulation error: ${JSON.stringify(simErr)},
        Sender Balance: ${senderBalance},
        Transfer Amount: ${amount} ${tokenSymbol || "Tokens"},
        Token Mint: ${mintAddressBase58 || "Unknown"},
        Destination: ${toAddress},
        Estimated Fee: ${estimatedFee} SOL,
        Units Consumed: ${unitsConsumed ?? "Unknown"},
        Parsed Instructions: ${JSON.stringify(parsedInstructions)},
        Action: Sending ${amount} ${tokenSymbol || "Tokens"} to ${toAddress} on Solana Devnet.
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

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!confimedWithPassword) {
    return (
      <ConfirmWithPassword
        password={password}
        setPassword={setPassword}
        setConfimedWithPassword={setConfimedWithPassword}
      />
    );
  }

  // ── Simulating overlay ─────────────────────────────────────────────────────
  if (simulating) {
    return <SimulatingOverlay />;
  }

  // ── Sending spinner ────────────────────────────────────────────────────────
  if (isSending) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <div className="relative">
          <div className="border-t-2 border-primary rounded-full animate-spin">
            <div className="h-16 w-16" />
          </div>
          <img src="/logo.png" alt="logo" className="h-8 w-8 absolute top-4 left-4" />
        </div>
        <p className="text-xs text-gray-400">Sending transaction…</p>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (signature) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <div className="flex bg-green-500/10 rounded-full p-4">
          <CheckCircleIcon size={40} weight="fill" className="text-green-500" />
        </div>
        <div className="text-center flex flex-col gap-1">
          <p className="text-xs font-semibold text-gray-200">Transaction sent successfully!</p>
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary"
          >
            View on Solana Explorer
          </a>
        </div>
        <SectionCard>
          <Row
            label="To"
            value={shortAddress(toAddress)}
            icon={<ArrowUpIcon size={13} />}
            mono
            accent="neutral"
          />
          <Row
            label="Amount"
            value={`${amount} ${tokenSymbol || "Tokens"}`}
            icon={<CurrencyDollarIcon size={13} />}
            accent="red"
          />
          <Row
            label="Network"
            value="Devnet"
            icon={<GlobeIcon size={13} />}
            accent="neutral"
          />
        </SectionCard>
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/7 hover:bg-white/11 transition-colors rounded-full text-white font-medium w-full text-xs mt-2"
        >
          Done
        </button>
      </div>
    );
  }

  // ── Main confirm view ──────────────────────────────────────────────────────
  const canProceedWithMissingAta = canProceedWithAtaCreation(simulationResult);

  return (
    <>
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3 pb-12">
        {/* Header */}
        <div className="flex gap-3 items-center mb-1">
          <div className="flex bg-white/5 rounded-full p-4">
            <img src={tokenLogo || "/logo.png"} alt="logo" className="w-8" />
          </div>
          <div>
            <h2 className="text-sm">Confirm Send</h2>
            <p className="text-xs text-gray-500">Review before sending</p>
          </div>
        </div>

        {/* Simulation status */}
        {simulationResult && (
          <div className="flex items-center justify-between gap-2">
            <StatusBadge err={simErr} />
          </div>
        )}

        {simErr && !isAiExplanationError && (
          <AiCrad loading={isAiExplanationLoading} content={aiExplanation} />
        )}

        {canProceedWithMissingAta && (
          <div className="flex items-start gap-2 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20 px-3 py-2.5">
            <WarningCircleIcon size={14} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/80 leading-5">
              Destination {shortAddress(toAddress)} does not have an ATA for {tokenSymbol || "this token"}. The ATA
              will be created and you will pay the account creation fee. Confirm to continue.
            </p>
          </div>
        )}

        {/* No simulation result yet */}
        {!simulationResult && !simulating && (
          <div className="flex items-center gap-2 rounded-xl bg-yellow-500/[0.07] border border-yellow-500/20 px-3 py-2.5">
            <WarningCircleIcon size={14} className="text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-300/80">Simulation data unavailable</p>
          </div>
        )}

        {/* Transfer details */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-500 px-0.5">Transfer</p>
          <SectionCard>
            <div className="px-3 py-2.5 border-b border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/10 shrink-0">
                    <ArrowUpIcon size={10} weight="bold" className="text-red-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Send to</p>
                    <p className="text-xs font-mono text-gray-200 truncate">{shortAddress(toAddress)}</p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-red-400 shrink-0">
                  -{amount} {tokenSymbol || "Tokens"}
                </p>
              </div>
            </div>
            <Row
              label="From"
              value={account?.pubkey ? shortAddress(account.pubkey) : "—"}
              icon={<GlobeIcon size={13} />}
              mono
              accent="neutral"
            />
            <Row
              label="Network"
              value="Devnet"
              icon={<GlobeIcon size={13} />}
              accent="neutral"
            />
          </SectionCard>
        </div>

        {/* Simulation details */}
        {simulationResult && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-gray-500 px-0.5">Details</p>
            <SectionCard>
              <Row
                label="Amount"
                value={`${amount} ${tokenSymbol || "Tokens"}`}
                icon={<CurrencyDollarIcon size={13} />}
                accent="red"
              />
              <Row
                label="Estimated fee"
                value={`~${estimatedFee.toFixed(6)} SOL`}
                icon={<LightningIcon size={13} />}
                accent="neutral"
              />
              {unitsConsumed !== undefined && (
                <Row
                  label="Compute units"
                  value={unitsConsumed.toLocaleString()}
                  icon={<CpuIcon size={13} />}
                  accent="neutral"
                />
              )}
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
      </div>

      {/* Sticky action buttons */}
      <div className="flex gap-3 sticky bottom-0 bg-bg/80 backdrop-blur-sm pt-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/7 hover:bg-white/11 transition-colors rounded-full text-white font-medium w-full text-xs"
        >
          <XIcon size={13} weight="bold" />
          Cancel
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-full text-white font-medium w-full text-xs inset-top"
          disabled={!toAddress || !amount || simulating || !canSend}
          onClick={handleSend}
        >
          <CheckIcon size={13} weight="bold" />
          Send
        </button>
      </div>
    </>
  );
}