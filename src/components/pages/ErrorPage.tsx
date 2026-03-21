import { useRouteError } from "react-router-dom";
import { useAccountStore } from "../../store";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import SafeArea from "../ui/layout/SafeArea";
import BackButton from "../ui/util/BackButton";

export default function ErrorPage() {
  const account = useAccountStore((state) => state.account);
  const errors = useRouteError();

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <div className="mt-4 text-xs text-amber-300 bg-amber-500/5 p-4 rounded">
          Oops! Something went wrong while loading this page. Please try again later.
        </div>
        
        <div className="mt-4 text-xs text-red-300 bg-red-500/5 p-4 rounded">
          {`${errors}`}
        </div>

      </div>
    </SafeArea>
  )
}