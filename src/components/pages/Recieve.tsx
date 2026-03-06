import { CaretLeftIcon } from "@phosphor-icons/react";
import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import QrCode from "../ui/recieve/QrCode";
import { useNavigate } from "react-router-dom";

export default function Recieve() {
  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();
  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center">
          <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center" onClick={() =>  navigate(-1)}>
            <CaretLeftIcon size={16} weight="bold" className="text-gray-200" />
          </button>
          <ProfileAvatar account={account} accountLoading={false} />
        </div>
        <div className="flex flex-col justify-center items-center mt-12 gap-1">
          <h1 className="text-lg font-bold">Receive</h1>
          <QrCode value={account ? account.pubkey : ""} />
          <p className="text-xs text-gray-500 text-center w-[80%] mt-2">
            this QR contains your wallet address.
            can only receive SOL and SPL tokens on the Solana blockchain.
          </p>
        </div>
      </div>
    </SafeArea>
  )
}