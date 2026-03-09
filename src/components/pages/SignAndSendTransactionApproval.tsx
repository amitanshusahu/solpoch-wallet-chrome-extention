import { useSearchParams } from "react-router-dom";
import SafeArea from "../ui/layout/SafeArea";
import { useEffect, useState } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";
import { SystemInstruction, SystemProgram, Transaction } from "@solana/web3.js";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";
import { lamportsToSol } from "../../lib/utils/solana/solLamportConversion";

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

  useEffect(() => {
    alert(`Fetching approval for ID: ${id}`);
    async function getApproval() {
      if (!id) {
        console.error("No approval ID found in search params");
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

  if (!confimedWithPassword) {
    return <ConfirmWithPassword password={password} setPassword={setPassword} setConfimedWithPassword={setConfimedWithPassword} />
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
    // window.close();
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

  return (
    <SafeArea>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Sign and Send Transaction Approval</h1>
        <p className="mb-4">Do you want to approve this transaction?</p>
        {res && (
          <div className="mb-4">
            <p>To: {res.to}</p>
            <p>Amount: {res.amount} SOL</p>
          </div>
        )}
        <div className="flex gap-4">
          <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
          <button onClick={handleReject} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
        </div>
      </div>
    </SafeArea>
  )
}