import { useEffect, useState } from "react";
import { sendMessage } from "./lib/utils/chrome/message";
import { useNavigate } from "react-router-dom";
import SafeArea from "./components/ui/layout/SafeArea";
import { useAccountStore } from "./store";
import Unlock from "./components/ui/home/Unlock";
import ProfileAvatar from "./components/ui/home/ProfileAvatar";
import { ArrowDownLeftIcon, ArrowsLeftRightIcon, ArrowUpRightIcon, DotsThreeIcon, GearIcon } from "@phosphor-icons/react";
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

  const cleanWallet = async () => {
    await sendMessage("VAULT_CLEAR", undefined);
  }

  if (status === "LOCKED") {
    return <Unlock setStatus={setStatus} />;
  }

  return (
    <SafeArea>
      <div>
        <div className="bg-img p-6">
          <div className="flex items-center justify-between">
            <ProfileAvatar account={account} accountLoading={false} />
            <button className="p-1.5 rounded-full bg-white/5">
              <GearIcon size={24} className="text-gray-300" weight="fill" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="mt-6 flex flex-col items-center justify-center">
              <h3 className="text-xs text-gray-300 mb-2">Total Balance</h3>
              <h1 className="text-5xl font-semibold">$0.00</h1>
              <p className="text-sm text-emerald-500 mt-2">+2.5% from last week</p>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                >
                  <ArrowUpRightIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Send</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                >
                  <ArrowDownLeftIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Recive</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                >
                  <ArrowsLeftRightIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">Swap</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={cleanWallet}
                >
                  <DotsThreeIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">More</span>
              </div>
            </div>
          </div>

        </div>

        <div className="p-6">
          <h2 className="text-sm">Tokens</h2>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">A</div>
              <div>
                <h3 className="text-sm">Amit Coin</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">K</div>
              <div>
                <h3 className="text-sm">Kirat Coin</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">S</div>
              <div>
                <h3 className="text-sm">Jupiter</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">S</div>
              <div>
                <h3 className="text-sm">Solana</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">S</div>
              <div>
                <h3 className="text-sm">Solana</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">S</div>
              <div>
                <h3 className="text-sm">Solana</h3>
                <p className="text-xs text-gray-500">0.00</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <p className="text-sm">$17,000</p>
              <p className="text-xs text-emerald-500">+2.5%</p>
            </div>
          </div>
        </div>

      </div>
    </SafeArea>
  );
}

export default App;
