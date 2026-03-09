import { useNavigate, useSearchParams } from "react-router-dom";
import SafeArea from "../ui/layout/SafeArea";
import { useEffect, useState } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";
import { SystemInstruction, SystemProgram, Transaction, type SimulatedTransactionResponse } from "@solana/web3.js";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";
import { lamportsToSol } from "../../lib/utils/solana/solLamportConversion";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import { CheckIcon, CodeIcon, XIcon } from "@phosphor-icons/react";
import { useAccountStore } from "../../store";

export default function SignAndSendTransactionApproval() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [password, setPassword] = useState("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const [tx, setTx] = useState<number[] | null>(null);
  const [res, setRes] = useState<{
    to: string;
    amount: number;
  } | null>(null);
  const account = useAccountStore((state) => state.account);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulatedTransactionResponse | null>(null);

  useEffect(() => {
    async function getApproval() {
      if (!id) {
        console.error("No approval ID");
        return;
      }
      try {
        const approval = await sendMessage("GET_APPROVALS_FROM_MANAGER", {
          id,
          type: "APPROVAL_SIGN_AND_SEND_TRANSACTION",
        });
        // Narrow via the discriminant — no casts needed
        if (approval?.type === "APPROVAL_SIGN_AND_SEND_TRANSACTION") {
          const tx = Transaction.from(approval.payload.transaction);
          setTx(approval.payload.transaction);

          tx.instructions.forEach(ix => {
            if (ix.programId.equals(SystemProgram.programId)) {
              const decoded = SystemInstruction.decodeTransfer(ix);
              setRes({
                to: decoded.toPubkey.toBase58(),
                amount: lamportsToSol(decoded.lamports),
              })
            }
          });
        }
      } catch (error) {
        console.error("Failed to get approval:", error);
      }
    }
    if (!tx) {
      getApproval();
    }

  }, [id]);

  useEffect(() => {
    async function simulateTx() {
      if (!tx) return;
      setSimulating(true);
      try {
        const response = await sendMessage("SIMULATE_USING_TRANSACTION", {
          transaction: tx,
          password,
        })
        setSimulationResult(response);
      } catch (error) {
        console.error("Failed to simulate transaction:", error);
      } finally {
        setSimulating(false);
      }
    }

    if (tx && confimedWithPassword) {
      simulateTx();
    }
  }, [tx, confimedWithPassword])

  if (!confimedWithPassword) {
    return (
      <SafeArea>
        <div className="p-6 h-full">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <ProfileAvatar account={account} accountLoading={false} />
            </div>
            <ConfirmWithPassword password={password} setPassword={setPassword} setConfimedWithPassword={setConfimedWithPassword} />
          </div>
        </div>
      </SafeArea>
    )
  }

  const handleApprove = async () => {
    if (!tx) {
      console.error("No transaction found to approve");
      return;
    }
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_AND_SEND_TRANSACTION", {
      id: id!,
      approved: true,
      tx: tx,
      password: password,
    });
    window.close();
  };

  const handleReject = async () => {
    if (!tx) {
      console.error("No transaction found to approve");
      return;
    }
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_AND_SEND_TRANSACTION", {
      id: id!,
      approved: false,
      tx: tx,
      password: password,
    });
    window.close();
  };

  if (simulating) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-4">
        <p className="text-sm text-gray-200">Sending transaction...</p>
        <div className="relative">
          <div className="border-t-4 border-primary rounded-full p-2  animate-spin">
            <div className="h-20 w-20"></div>
          </div>
          <img src="/logo.png" alt="Solana Logo" className="h-10 w-10 absolute top-7 left-7" />
        </div>
      </div>
    )
  }

  return (
    <SafeArea>
      <div className="p-6 h-full">
        <div className="h-full flex flex-col justify-between">
          <div className="flex justify-between items-center sticky top-0 z-10">
            <ProfileAvatar account={account} accountLoading={false} />
            <button
              className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center"
            // onClick={showRowCodeFromDapp}
            >
              <CodeIcon size={16} weight="bold" className="text-gray-200" />
            </button>
          </div>
          {/* content */}
          <div className="h-full overflow-y-auto scrollbar-none">
            <h1 className="text-xl font-bold mb-4">Sign and Send Transaction Approval</h1>
            <p className="mb-4">Do you want to approve this transaction?</p>
            {res && (
              <div className="mb-4">
                <p>To: {res.to}</p>
                <p>Amount: {res.amount} SOL</p>
              </div>
            )}


          </div>
          {/* buttons */}
          <div className="flex gap-4 sticky bottom-6 left-0 right-0 z-100">
            <button
              onClick={handleReject}
              className="px-4 py-2 bg-white/10 rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center backdrop-blur-xs"
            // disabled={!toAddress || !amount}
            >
              <XIcon size={14} weight="bold" className="text-gray-200" />
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
              // disabled={!toAddress || !amount || simulating || !canSend}
              onClick={handleApprove}
            >
              <CheckIcon size={14} weight="bold" className="text-gray-200" />
              Approve
            </button>
          </div>
        </div>
      </div>
    </SafeArea>
  )
}