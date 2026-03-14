import { CaretLeftIcon, CopyIcon, PlusIcon } from "@phosphor-icons/react";
import SafeArea from "../ui/layout/SafeArea";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../store";
import { useEffect, useState } from "react";
import type { Account } from "../../types/vault";
import { sendMessage } from "../../lib/utils/chrome/message";
import { RpcService } from "../../lib/rpc";
import { lamportsToSol } from "../../lib/utils/solana/solLamportConversion";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";

export default function Accounts() {

  const account = useAccountStore((state) => state.account);
  const setAccount = useAccountStore((state) => state.setAccount);
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balanceMap, setBalanceMap] = useState<Record<string, number>>({});
  const [password, setPassword] = useState<string>("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);

  const fetchAccounts = async () => {
    const accounts = await sendMessage("GET_ACCOUNTS", undefined);
    console.log("fetched accounts:", accounts);
    setAccounts(accounts);
    const balanceMap: Record<string, number> = {};
    for (const acc of accounts) {
      const balance = await RpcService.getBalance(acc.pubkey);
      balanceMap[acc.pubkey] = balance;
    }
    setBalanceMap(balanceMap);
  }

  useEffect(() => {
    fetchAccounts();
  }, [])

  const [isKeyCopied, setIsKeyCopied] = useState(false);
  const handleCopyKey = async () => {
    if (account) {
      await navigator.clipboard.writeText(account.pubkey);
      setIsKeyCopied(true);
      setTimeout(() => setIsKeyCopied(false), 2000);
    }
  };

  const setActiveAccount = async (index: number) => {
    const response = await sendMessage("SET_ACTIVE_ACCOUNT", { index });
    setAccount(response);
  }

  const handleAccountClick = async (acc: Account) => {
    setActiveAccount(acc.index);
  }

  const handleAddAccount = async () => {
    const response = await sendMessage("ADD_ACCOUNT", { password: password });
    await fetchAccounts();
    setActiveAccount(response.index);
  }

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
        {/* header */}
        <div className="flex justify-between items-center bg-transparent pb-6">
          <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center backdrop-blur-xs" onClick={() => navigate(-1)}>
            <CaretLeftIcon size={16} weight="bold" className="text-gray-200" />
          </button>
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3 pb-6">
          
          {/* accounts list */}
          <div className="flex flex-col gap-2">
            {
              accounts.map((acc) => (
                <div
                  className={`flex justify-between items-center mt-2 p-4  rounded-lg ${account?.index === acc.index ? "border border-primary/50 bg-primary/5" : "border border-transparent bg-white/5"} cursor-pointer`}
                  key={acc.index}
                  onClick={() => handleAccountClick(acc)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">A{acc.index}</div>
                    <div>
                      <h3 className="text-sm">{acc.pubkey.slice(0, 7)}...{acc.pubkey.slice(-4)}</h3>
                      <p className="text-xs text-gray-500">{balanceMap[acc.pubkey] ? lamportsToSol(balanceMap[acc.pubkey]) : "0.0000"} SOL</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 items-end">
                    <button className="p-2 text-xs rounded-full bg-white/5 flex justify-center items-center" onClick={handleCopyKey}>
                      {
                        isKeyCopied ? "Copied!" : <CopyIcon size={14} className="text-gray-200" />
                      }
                    </button>
                  </div>
                </div>
              ))
            }
          </div>

          <button
            className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-4 disabled:bg-primary/50 flex gap-2 justify-center items-center"
            onClick={handleAddAccount}
          >
            <PlusIcon size={14} weight="bold" className="text-gray-200" />
            Add Account
          </button>
        </div>

      </div>
    </SafeArea>
  )
}