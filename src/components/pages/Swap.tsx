import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import BackButton from "../ui/util/BackButton";

export default function Swap() {
  const account = useAccountStore((state) => state.account);

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <div className="mt-4 text-xs text-amber-300 bg-amber-500/5 p-4 rounded">
          this feature is coming soon... we are working hard to bring you the best swapping experience on Solana. Stay tuned!
        </div>

        {/* swap page content goes here */}
        

      </div>
    </SafeArea>
  )
}