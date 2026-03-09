import { useSearchParams } from "react-router-dom";
import SafeArea from "../ui/layout/SafeArea";
import { useEffect } from "react";
import { sendMessage } from "../../lib/utils/chrome/message";
import { SystemInstruction, SystemProgram, Transaction } from "@solana/web3.js";

export default function SignAndSendTransactionApproval() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    alert(`Fetching approval for ID: ${id}`);
    async function getApproval() {
      if (!id) {
        console.error("No approval ID found in search params");
        return;
      }
      try {
        console.log("Fetching approval inside getApproval for ID:", id);
        const approval = await sendMessage("GET_APPROVALS_FROM_MANAGER", { id });
        console.log("Approval request:", approval);
        if (approval) {
          const tx = Transaction.from(approval.payload.transaction);
          console.log("Transaction:", tx);

          tx.instructions.forEach(ix => {
            if (ix.programId.equals(SystemProgram.programId)) {
              const decoded = SystemInstruction.decodeTransfer(ix)

              alert(`To: ${decoded.toPubkey.toBase58()}`)
              alert(`Amount: ${decoded.lamports}`)
            }
          })
        }
      } catch (error) {
        console.error("Failed to get approval:", error);
      }
    }
    getApproval();

  }, [id]);

  const handleApprove = async () => {
    await sendMessage("APPROVAL_MANAGER_RESSOLVE", { id: id!, approved: true, tx: [], password: "password" });
    window.close();
  };

  const handleReject = async () => {
    await sendMessage("APPROVAL_MANAGER_RESSOLVE", { id: id!, approved: false });
    window.close();
  };

  return (
    <SafeArea>
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Sign and Send Transaction Approval</h1>
        <p className="mb-4">Do you want to approve this transaction?</p>
        <div className="flex gap-4">
          <button onClick={handleApprove} className="bg-green-500 text-white px-4 py-2 rounded">Approve</button>
          <button onClick={handleReject} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
        </div>
      </div>
    </SafeArea>
  )
}