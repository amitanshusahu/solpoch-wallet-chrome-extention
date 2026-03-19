import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/chrome/message";
import { useNavigate } from "react-router-dom";
import SafeArea from "./components/ui/layout/SafeArea";
import { useAccountStore } from "./store";
import Unlock from "./components/ui/home/Unlock";
import ProfileAvatar from "./components/ui/home/ProfileAvatar";
import { ArrowDownLeftIcon, ArrowsLeftRightIcon, ArrowUpRightIcon, DotsThreeIcon, GearIcon, UserCirclePlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { RpcService } from "./lib/rpc";
import { lamportsToSol } from "./lib/utils/solana/conversion";
import TokenList from "./components/ui/home/TokenList";
// import PopCard from "./components/ui/layout/PopCard";

function App() {
  const [status, setStatus] = useState<"LOCKED" | "UNLOCKED">("LOCKED");
  const setAccount = useAccountStore((state) => state.setAccount);
  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkVault() {
      const exists = await sendMessage("VAULT_EXISTS", undefined);
      const isUnlocked = await sendMessage("VAULT_IS_UNLOCKED", undefined);

      if (exists && isUnlocked) {
        const activeAccount = await sendMessage("VAULT_GET_ACTIVE_ACCOUNT", undefined);
        setAccount(activeAccount);
        setStatus("UNLOCKED");
      } else if (exists && !isUnlocked) {
        setStatus("LOCKED");
      } else {
        navigate("/onboarding#?onboarding : true");
      }
    }

    checkVault();
  }, []);

  const balanceQuery = useQuery({
    queryKey: ["balance", account?.pubkey],
    queryFn: async () => {
      if (!account) return 0;
      const blance = await RpcService.getBalance(account.pubkey);
      return blance;
    }
  })

  // const cleanWallet = async () => {
  //   await sendMessage("VAULT_CLEAR", undefined);
  // }

  // if (status === "LOCKED") {
  //   return <Unlock setStatus={setStatus} />;
  // }

  return (
    <SafeArea>
      <div>
        <div className="bg-img p-6">
          <div className="flex items-center justify-between">
            <ProfileAvatar account={account} accountLoading={false} />
            <div className="flex gap-1">
              <button
                className="p-1.5 rounded-full bg-white/5"
                onClick={() => navigate("/accounts")}
              >
                <UserCirclePlusIcon size={24} className="text-gray-300" weight="fill" />
              </button>
              <button className="p-1.5 rounded-full bg-white/5" onClick={() => navigate("/settings")}>
                <GearIcon size={24} className="text-gray-300" weight="fill" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="mt-6 flex flex-col items-center justify-center">
              <h3 className="text-xs text-gray-300 mb-2">Total Balance</h3>
              <h1 className="text-5xl font-semibold text-center">{balanceQuery.data ? (lamportsToSol(balanceQuery.data)) : "0.00"} SOL</h1>
              <p className="text-sm text-emerald-500 mt-2">Solana Devnet</p>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={() => navigate("/send")}
                >
                  <ArrowUpRightIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Send</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={() => navigate("/recieve")}
                >
                  <ArrowDownLeftIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Recieve</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={() => navigate("/swap")}
                >
                  <ArrowsLeftRightIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Swap</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={() => navigate("/more")}
                >
                  <DotsThreeIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">More</span>
              </div>
            </div>
          </div>

        </div>

        <TokenList />

      </div>
    </SafeArea>
  );
}

export default App;
