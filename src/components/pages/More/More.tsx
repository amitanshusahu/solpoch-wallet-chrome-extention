import { ClockCounterClockwiseIcon, CodeIcon, LinkIcon, UserCirclePlusIcon } from "@phosphor-icons/react";
import { useAccountStore } from "../../../store";
import ProfileAvatar from "../../ui/home/ProfileAvatar";
import SafeArea from "../../ui/layout/SafeArea";
import BackButton from "../../ui/util/BackButton";
import OptionButtons from "../../ui/util/OptionButtons";
import { useNavigate } from "react-router-dom";

export default function More() {
  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();
  const visitSolanaDocs = () => {
    const docsUrl = "https://solana.com/docs";
    window.open(docsUrl, "_blank");
  }

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <h4 className="text-sm text-gray-400 mt-3 my-2">Actions</h4>
        <OptionButtons
          icon={
            <ClockCounterClockwiseIcon
              size={13}
              weight="bold"
              className="text-gray-300"
            />
          }
          label="Transaction History"
          onClick={() => navigate("/transaction-history")}
        />
        <OptionButtons
          icon={
            <UserCirclePlusIcon
              size={13}
              weight="bold"
              className="text-gray-300"
            />
          }
          label="Create ATA"
          onClick={() => navigate("/create-ata")}
        />

        <h4 className="text-sm text-gray-400 mt-5 my-2">Developer Tools</h4>
        <OptionButtons
          icon={
            <CodeIcon
              size={13}
              weight="bold"
              className="text-gray-300"
            />
          }
          label="Curl Commands"
          onClick={() => navigate("/http-methods")}
        />
        <OptionButtons
          icon={
            <LinkIcon
              size={13}
              weight="bold"
              className="text-gray-300"
            />
          }
          label="Solana Docs"
          onClick={visitSolanaDocs}
        />


      </div>
    </SafeArea>
  )
}