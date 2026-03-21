import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../../store";
import ProfileAvatar from "../../ui/home/ProfileAvatar";
import SafeArea from "../../ui/layout/SafeArea";
import BackButton from "../../ui/util/BackButton";
import OptionButtons from "../../ui/util/OptionButtons";
import { ShieldCheckIcon, TrashIcon, UsersThreeIcon, WifiHighIcon } from "@phosphor-icons/react";
import { ShieldWarningIcon } from "@phosphor-icons/react/dist/ssr";

export default function Settings() {
  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

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
            <WifiHighIcon
              size={13}
              weight="bold"
            />
          }
          label="Change Network"
          onClick={() => navigate("/change-network")}
        />
        <OptionButtons
          icon={
            <UsersThreeIcon
              size={13}
              weight="bold"
            />
          }
          label="Address Book"
          onClick={() => navigate("/address-book")}
        />
        <OptionButtons
          icon={
            <ShieldCheckIcon
              size={13}
              weight="fill"
            />
          }
          label="Trusted Origin"
          onClick={() => navigate("/trusted-origin")}
        />

        <h4 className="text-sm text-gray-400 mt-5 my-2">Wallet Security</h4>
        <OptionButtons
          icon={
            <ShieldWarningIcon
              size={13}
              weight="bold"
            />
          }
          label="View Private Key"
          type="warning"
          onClick={() => navigate("/view-private-key")}
        />
        <OptionButtons
          icon={
            <ShieldWarningIcon
              size={13}
              weight="bold"
            />
          }
          type="warning"
          label="View Mnemonics"
          onClick={() => navigate("/view-mnemonics")}
        />
        <OptionButtons
          icon={
            <TrashIcon
              size={13}
              weight="bold"
            />
          }
          label="Delete Wallet"
          type="danger"
          onClick={() => navigate("/delete-wallet")}
        />

      </div>
    </SafeArea>
  )
}