import { useState, type ChangeEvent } from "react";
import SafeArea from "../layout/SafeArea";
import { InfoIcon, LockIcon } from "@phosphor-icons/react";
import { useAccountStore } from "../../../store";
import { sendMessage } from "../../../lib/utils/chrome/message";

export default function Unlock({
  setStatus,
}: {
  setStatus: (status: "LOCKED" | "UNLOCKED") => void;
}) {
  const setAccount = useAccountStore((state) => state.setAccount);
  const [password, setPassword] = useState("");
  const [infoText, setInfoText] = useState("Your password is required to access your wallet.");
  const handelPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  async function handleUnlock(password: string) {
    try {
      const account = await sendMessage("VAULT_UNLOCK", { password });
      setAccount(account);
      setStatus("UNLOCKED");
    } catch (error) {
      setInfoText("Incorrect password. Please try again.");
    }
  }

  return (
    <SafeArea>
      <div className="w-full h-full bg-bg p-8 flex flex-col justify-between items-center">
        <div className="h-full flex flex-col justify-center items-center">
          <div className="flex items-center justify-center pb-16">
            <img src="/logo-long.png" alt="logo" className="h-[50px]" />
          </div>
          <div>
            <div className="flex gap-2">
              <LockIcon size={16} className="text-gray-400" />
              <h1 className="text-sm mb-2 font-bold">Enter Unlock Pin</h1>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={password}
              onChange={handelPasswordChange}
            />
            <div className="text-xs">
              <div className="flex gap-2 mb-4">
                <InfoIcon size={14} className="text-primary" />
                <h3 className={`text-xs ${infoText === "Your password is required to access your wallet." ? "text-primary" : "text-red-500"}`}>{infoText}</h3>
              </div>
              <p className="text-gray-400">
                If you forgot your password, you can reset it using your secret recovery phrase. Please note that resetting your password will not affect your funds, but you will need to set up a new password.
              </p>
            </div>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-center text-xs inset-top mt-3 disabled:bg-primary/50"
          disabled={password.length < 8}
          onClick={() => handleUnlock(password)}
        >
          Unlock Wallet
        </button>
      </div>
    </SafeArea>
  )
}