import { useState } from "react";
import type { Account } from "../../../types/vault";
import { CopyIcon } from "@phosphor-icons/react";

export default function ProfileAvatar({
  account,
  accountLoading,
}: {
  account: Account | null,
  accountLoading: boolean,
}) {
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const handleCopyKey = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.pubkey);
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2000);
    }
  };
  return (
    <div className="flex backdrop-blur-xs">
      <div className="flex bg-white/5 rounded-full w-fit overflow-hidden items-center justify-center p-1 gap-2">
        <div className="p-2 bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-sm uppercase">A{account?.index}</div>
        {
          accountLoading ? <div className="w-16 h-4 bg-white/10 rounded-full animate-pulse" /> : <div className="text-xs">{account?.pubkey.slice(0, 7)}...{account?.pubkey.slice(-4)}</div>
        }
        <button className="p-1 text-xs" onClick={handleCopyKey}>
          {
            isKeyCopied ? "Copied!" : <CopyIcon size={14} className="text-gray-200" />
          }
        </button>
      </div>
    </div>
  )
}