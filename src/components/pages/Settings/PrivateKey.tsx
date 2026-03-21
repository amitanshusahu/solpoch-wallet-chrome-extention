import { CopyIcon, ShieldWarningIcon } from "@phosphor-icons/react";
import { useAccountStore } from "../../../store";
import ProfileAvatar from "../../ui/home/ProfileAvatar";
import SafeArea from "../../ui/layout/SafeArea";
import BackButton from "../../ui/util/BackButton";
import { StarFourIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import ConfirmWithPassword from "../../ui/util/ConfirmWithPassword";
import { sendMessage } from "../../../lib/utils/chrome/message";

export default function PrivateKey() {

  const account = useAccountStore((state) => state.account);
  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const [coping, setCopying] = useState(false);

  const [password, setPassword] = useState<string>("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);


  const handleCopyKey = async () => {
    if (!account) return;
    setCopying(true);
    const privateKey = await sendMessage("GET_PRIVATE_KEY", {
      index: account.index,
      password,
    });
    await navigator.clipboard.writeText(privateKey);
    setCopying(false);
    setIsKeyCopied(true);
    setTimeout(() => setIsKeyCopied(false), 2000);
  };

  if (!confimedWithPassword) {
    return (
      <SafeArea>
        <div className="p-6 h-full">
          <ConfirmWithPassword
            password={password}
            setPassword={setPassword}
            setConfimedWithPassword={setConfimedWithPassword}
          />
        </div>
      </SafeArea>
    );
  }

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <div className="mt-4 text-xs text-amber-300 bg-amber-500/5 p-4 rounded flex gap-1">
          <div>
            <ShieldWarningIcon size={12} weight="fill" />
          </div>
          Exposing your private key is a security risk, are your sure you want to see it. make sure you know what you are doing. your {account?.pubkey.slice(0, 4)}..{account?.pubkey.slice(6, 11)} will be compromized if someone other than you gets this private key
        </div>

        <h4 className="text-xs text-gray-500 mt-6">Your Private Key for account A{account?.index}</h4>
        <div className="mt-2">
          <div className="flex justify-around w-full p-1 bg-white/5 rounded text-sm mt-1 font-mono items-center">
            {
              `***********************`.split('').map(() => (
                <StarFourIcon size={12} weight="fill" className="text-gray-400" />
              ))
            }
          </div>
          <button
            className="p-1 bg-primary rounded text-sm mt-2 font-mono flex items-center gap-2 copy px-3"
            onClick={handleCopyKey}
          >
            <span className="text-xs">
              {
                coping ? "Copying..." : isKeyCopied ? "Copied!" : "Copy Private Key"
              }
            </span>
            <CopyIcon size={12} />
          </button>
        </div>


      </div>
    </SafeArea>
  )
}