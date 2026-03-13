import { useState, type ChangeEvent } from "react";
import { useAccountStore } from "../../../store";
import { sendMessage } from "../../../lib/utils/chrome/message";
import { InfoIcon, LockIcon } from "@phosphor-icons/react";

export default function ConfirmWithPassword({
  password,
  setPassword,
  setConfimedWithPassword,
}: {
  password: string;
  setPassword: (password: string) => void;
  setConfimedWithPassword: (confirmed: boolean) => void;
}) {
  const setAccount = useAccountStore((state) => state.setAccount);
  const [infoText, setInfoText] = useState("Your password is required to confirm this action.");
  const handelPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }
  async function handelConfirm(password: string) {
    try {
      const account = await sendMessage("VAULT_UNLOCK", { password });
      setAccount(account);
      setConfimedWithPassword(true);
    } catch (error) {
      setInfoText("Incorrect password. Please try again.");
      setConfimedWithPassword(false);
    }
  }

  return (
    <div className="w-full h-full bg-bg flex flex-col justify-between items-center">
      <div className="h-full flex flex-col w-full pt-14 px-4">
        <div className="flex items-center justify-center pb-16">
          {/* <img src="/logo-long.png" alt="logo" className="h-[50px]" /> */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex bg-white/10 rounded-full p-1">
              <img src="/detective.svg" alt="detective" className="h-[130px] w-[130px]"/>
            </div>
            <p className="text-xs text-gray-400 mt-1">just to be extra sure that it's you</p>
          </div>
        </div>
        <div className="w-full flex flex-col">
          <div className="flex gap-2">
            <LockIcon size={16} className="text-gray-400" />
            <h1 className="text-sm mb-2 font-semibold text-gray-200">Enter Unlock Pin</h1>
          </div>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent tracking-[5px] placeholder:tracking-normal"
            value={password}
            onChange={handelPasswordChange}
          />
          <div className="text-xs">
            <div className="flex gap-2 mb-4">
              <InfoIcon size={14} className="text-primary" />
              <h3 className={`text-xs ${infoText === "Your password is required to confirm this action." ? "text-primary" : "text-red-500"}`}>{infoText}</h3>
            </div>
          </div>
        </div>
      </div>
      <button
        className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-center text-xs inset-top mt-3 disabled:bg-primary/50"
        disabled={password.length < 8}
        onClick={() => handelConfirm(password)}
      >
        Confim and Continue
      </button>
    </div>
  )
}