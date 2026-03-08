import { CheckIcon, XIcon } from "@phosphor-icons/react";
import type { SimulatedTransactionResponse } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { sendMessage } from "../../../lib/utils/chrome/message";
import ConfirmWithPassword from "../util/ConfirmWithPassword";
import { useNavigate } from "react-router-dom";
import { solToLamports } from "../../../lib/utils/solana/solLamportConversion";

export default function ConfirmSend({
  amount,
  toAddress,
}: {
  amount: string,
  toAddress: string,
}) {

  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulatedTransactionResponse | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const navigate = useNavigate();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    async function simulate() {
      setSimulating(true);
      try {
        const response = await sendMessage("SIMULATE_TRANSACTION", {
          to: toAddress,
          amount: solToLamports(parseFloat(amount)),
          password: password
        });
        setSimulationResult(response);
        if (!response?.err) {
          setButtonDisabled(false);
        }
      } catch (error) {
        console.error("Simulation error:", error);
        setButtonDisabled(true);
      } finally {
        setSimulating(false);
      }
    }
    if (confimedWithPassword) {
      simulate();
    }
  }, [toAddress, amount, confimedWithPassword]);

  const handleSend = async () => {
    setButtonDisabled(true);
    if(password.length === 0) {
      setConfimedWithPassword(false);
      setButtonDisabled(false);
      return;
    }
    try {
      const response = await sendMessage("SIGN_AND_SEND_TRANSACTION", {
        to: toAddress,
        amount: solToLamports(parseFloat(amount)),
        password: password
      });
      setSignature(response);
      console.log("Send response:", response);
    } catch (error) {
      console.error("Send error:", error);
    }
  }

  if (!confimedWithPassword) {
    return <ConfirmWithPassword password={password} setPassword={setPassword} setConfimedWithPassword={setConfimedWithPassword} />
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="text-sm font-bold mb-4">Confirm Send</h1>
        <div className="mb-12">
          <img src="/solana-logo.png" alt="Solana Logo" className="h-10 w-10" />
        </div>
        {
          simulating ? (
            <p>Simulating transaction...</p>
          ) : simulationResult ? (
            simulationResult.err ? (
              <p className="text-red-500">Simulation failed: {JSON.stringify(simulationResult.err)}</p>
            ) : (
              <>
                <p className="text-green-500">Simulation successful! Transaction is likely to succeed.</p>
                <div className="w-full bg-white/5 p-4 rounded-lg flex flex-col">
                  <div className="flex justify-between w-full gap-4">
                    <span className="text-xs text-gray-400">To</span>
                    <span className="text-xs text-gray-200">{toAddress}</span>
                  </div>
                  <div className="flex justify-between w-full gap-4 border-t border-bg mt-2 pt-2 border-b mb-2 pb-2">
                    <span className="text-xs text-gray-400">Amount</span>
                    <span className="text-xs text-gray-200">{amount} SOL</span>
                  </div>
                  <div className="flex justify-between w-full gap-4">
                    <span className="text-xs text-gray-400">Cluster</span>
                    <span className="text-xs text-gray-200">Devnet</span>
                  </div>
                </div>
              </>
            )
          ) : (
            <p>Ready to simulate transaction.</p>
          )
        }
        {
          signature ? (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-200">Transaction sent successfully!</p>
              <a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary mt-1 block">
                View on Solana Explorer
              </a>
            </div>
          ) : null
        }
      </div>
      {
        !signature ? (
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-white/10 rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
              disabled={!toAddress || !amount}
            >
              <XIcon size={14} weight="bold" className="text-gray-200" />
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
              disabled={!toAddress || !amount || simulating || (simulationResult ? !!simulationResult.err : false) || buttonDisabled}
              onClick={handleSend}
            >
              <CheckIcon size={14} weight="bold" className="text-gray-200" />
              Send
            </button>
          </div>
        ) : null
      }
    </>
  )
}