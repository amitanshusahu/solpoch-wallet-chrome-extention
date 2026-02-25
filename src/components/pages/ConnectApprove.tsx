import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { sendMessage } from "../../lib/utils/chrome/message";
import { useAccountStore } from "../../store";
import SafeArea from "../ui/layout/SafeArea";
import { CopyIcon, InfoIcon } from "@phosphor-icons/react";

export default function ConnectApprove() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get("origin");
  const logoUrl = searchParams.get("logoUrl") || "/logo.png";
  const [loading, setLoading] = useState(false);
  const account = useAccountStore((state) => state.account);
  const setAccount = useAccountStore((state) => state.setAccount);
  const [accountLoading, setAccountLoading] = useState(true);
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const activeAccount = await sendMessage("VAULT_GET_ACTIVE_ACCOUNT", undefined);
        setAccount(activeAccount);
      } catch (error) {
        console.error("Failed to fetch active account:", error);
      } finally {
        setAccountLoading(false);
      }
    }
    fetchAccount();
  }, [setAccount]);

  console.log(searchParams);

  const handleCopyKey = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.pubkey);
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2000);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    await sendMessage("APPROVAL_RESPONSE", { approved: true });
    window.close();
  };

  const handleReject = async () => {
    setLoading(true);
    await sendMessage("APPROVAL_RESPONSE", { approved: false });
    window.close();
  };

  return (
    <SafeArea>
      <div className="flex flex-col justify-between gap-6 p-6 h-full">
        <div className="flex">
          <div className="flex bg-white/5 rounded-full w-fit overflow-hidden items-center justify-center p-1 gap-2">
            <div className="p-2 bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-sm uppercase">A{account?.index}</div>
            {
              accountLoading ? <div className="w-16 h-4 bg-white/10 rounded-full animate-pulse" /> : <div className="p-2 text-xs">{account?.pubkey.slice(0, 4)}...{account?.pubkey.slice(-4)}</div>
            }
            <button className="p-1" onClick={handleCopyKey}>
              {
                isKeyCopied ? <CopyIcon size={14} className="text-gray-500" /> : <CopyIcon size={14} className="text-gray-200" />
              }
            </button>
          </div>
        </div>

        <div className="h-full">
          <div className="flex gap-4 mt-6 items-center">
            <img src={logoUrl} alt="favicon" className="w-12 h-12 rounded-md bg-white/5 p-2" />
            <div>
              <h2 className="text-sm">Approve Connect Request</h2>
              <h2 className="text-xs text-gray-300">{origin?.replace("https://", "").replace("http://", "")}</h2>
            </div>
          </div>
          <div className="rounded bg-primary/20 p-4 mt-8 flex gap-2">
            <div><InfoIcon size={12} weight="fill" className="text-primary" /></div>
            <h3 className="text-xs">By approving this connection, you allow <span className="text-primary">{origin}</span> to view your public key and request transactions. Always make sure you trust the sites you connect to.</h3>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="px-4 w-full py-1.5 text-sm bg-white/10 rounded-full "
            onClick={handleReject}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 w-full py-1.5 bg-primary rounded-full disabled:bg-primary/50 inset-top text-sm"
            onClick={handleApprove}
            disabled={loading}
          >
            Approve
          </button>
        </div>
      </div>
    </SafeArea>
  );
}