import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import QrCode from "../ui/recieve/QrCode";

export default function Recieve() {
  const account = useAccountStore((state) => state.account);
  return (
    <SafeArea>
      <div className="p-6">
        <ProfileAvatar account={account} accountLoading={false} />
        <div className="flex flex-col justify-center items-center mt-12 gap-1">
          <h1 className="text-lg font-bold">Receive</h1>
          <QrCode value={account ? account.pubkey : ""} />
          <p className="text-xs text-gray-500 text-center w-[80%]">
            this QR contains your wallet address.
            can only receive SOL and SPL tokens on the Solana blockchain.
          </p>
        </div>
      </div>
    </SafeArea>
  )
}