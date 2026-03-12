import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccountStore } from "../../store";
import { sendMessage } from "../../lib/utils/chrome/message";
import SafeArea from "../ui/layout/SafeArea";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";
import { CheckIcon, CodeIcon, EnvelopeSimpleIcon, InfoIcon, XIcon } from "@phosphor-icons/react";
import SectionCard from "../ui/popup/signAndSendTransaction/SectionCard";
import { createSignInMessage } from "../../lib/utils/helper/createSignInMessage";

export default function SignInApproval() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [password, setPassword] = useState("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);
  const [origin, setOrigin] = useState<string>("");
  const [logoUrl, setLogoUrl] = useState<string>("/logo.png");
  const account = useAccountStore((state) => state.account);
  const [message, setMessage] = useState<string>("");

  // get approval from approval manager using id
  useEffect(() => {
    async function getApproval() {
      if (!id) return;
      try {
        const approval = await sendMessage("GET_APPROVALS_FROM_MANAGER", {
          id,
          type: "APPROVAL_SIGN_IN",
        });
        if (approval?.type === "APPROVAL_SIGN_IN") {
          const signInMessage = createSignInMessage(approval.payload.input);
          setOrigin(approval.origin ?? "");
          setLogoUrl(approval.icon ?? "/logo.png");
          setMessage(signInMessage);
        }
      } catch (error) {
        console.error("Failed to get approval:", error);
      }
    }
    if (!message) getApproval();
  }, [id]);

  const handleApprove = async () => {
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_IN", {
      id: id!,
      approved: true,
      password,
    });
    window.close();
  };

  const handleReject = async () => {
    await sendMessage("APPROVAL_MANAGER_RESOLVE_APPROVAL_SIGN_IN", {
      id: id!,
      approved: false,
      password,
    });
    window.close();
  };

  if (!confimedWithPassword) {
    return (
      <SafeArea>
        <div className="p-6 h-full">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-center">
              <ProfileAvatar account={account} accountLoading={false} />
            </div>
            <ConfirmWithPassword
              password={password}
              setPassword={setPassword}
              setConfimedWithPassword={setConfimedWithPassword}
            />
          </div>
        </div>
      </SafeArea>
    );
  }


  return (
    <SafeArea>
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center sticky top-0 z-10 bg-bg/80 backdrop-blur-sm pb-6">
          <ProfileAvatar account={account} accountLoading={false} />
          <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center">
            <CodeIcon size={14} weight="bold" className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3 pb-6">

          {/* Title + origin */}
          <div>
            <div className="flex gap-4 items-center">
              <img src={logoUrl} alt="favicon" className="w-12 h-12 rounded-md bg-white/5 p-2" />
              <div>
                <h2 className="text-sm">Approve SignIn Request</h2>
                <h2 className="text-xs text-gray-300">{origin?.replace("https://", "").replace("http://", "")}</h2>
              </div>
            </div>
            <div className="rounded bg-primary/20 p-4 mt-8 flex gap-2">
              <div><InfoIcon size={12} weight="fill" className="text-primary" /></div>
              <h3 className="text-xs">By approving, you authorize <span className="text-primary">{origin}</span> to signIn</h3>
            </div>
          </div>

          {/* Message content */}
          <SectionCard>
            <div>
              <div className="flex items-center gap-2 px-3 py-2 justify-between">
                <h3 className="text-xs text-gray-400">Message to sign</h3>
                <EnvelopeSimpleIcon size={12} weight="fill" className="text-gray-500" />
              </div>
              <pre className="bg-white/10 rounded p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all text-gray-50">
                {message}
              </pre>
            </div>
          </SectionCard>

        </div>

        {/* Action buttons */}
        <div className="flex gap-3 sticky bottom-0 bg-bg/80 backdrop-blur-sm pt-3">
          <button
            onClick={handleReject}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/7 hover:bg-white/11 transition-colors rounded-full text-white font-medium w-full text-xs"
          >
            <XIcon size={13} weight="bold" />
            Reject
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-full text-white font-medium w-full text-xs inset-top"
          >
            <CheckIcon size={13} weight="bold" />
            Approve
          </button>
        </div>
      </div>
    </SafeArea>
  )
}