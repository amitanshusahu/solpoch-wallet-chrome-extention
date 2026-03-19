import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import BackButton from "../ui/util/BackButton";

export default function Settings() {
  const account = useAccountStore((state) => state.account);

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>




      </div>
    </SafeArea>
  )
}