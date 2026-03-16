import { useParams, useSearchParams } from "react-router-dom"
import SafeArea from "../ui/layout/SafeArea";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import { useAccountStore } from "../../store";
import { useEffect, useState } from "react";
import BackButton from "../ui/util/BackButton";
import { AtIcon, CaretRightIcon } from "@phosphor-icons/react";
import { AccountBookService } from "../../lib/core/walletService/accountBook.service";
import { vaultService } from "../../lib/core/vault/service";
import ConfirmWithPassword from "../ui/util/ConfirmWithPassword";

export default function SendTokens() {
  const param = useParams();
  const [searchParams] = useSearchParams();
  const tokenName = searchParams.get("name");
  const tokenLogo = searchParams.get("logo");
  const tokenSymbol = searchParams.get("symbol");
  const tokenDecimals = searchParams.get("decimals");
  const mintAddressBase58 = param.mint;

  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const account = useAccountStore((state) => state.account);
  const [accountBook, setAccountBook] = useState<{ name: string, address: string }[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [password, setPassword] = useState<string>("");
  const [confimedWithPassword, setConfimedWithPassword] = useState(false);

  const toogleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  }

  useEffect(() => {
    const fetchAccountBook = async () => {
      const result = await AccountBookService.getAll();
      setAccountBook(result ?? []);
    }
    fetchAccountBook();
  }, [])

  const handleSubmit = async () => {
    const signature = await vaultService.transferTokens(mintAddressBase58!, toAddress, (parseInt(amount) * Math.pow(10, parseInt(tokenDecimals || "0"))), password);

    console.log("Transfer signature:", signature);

  }

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
        {/* header */}
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>
        {/* body */}
        <div className="h-full flex flex-col justify-between">
          <div className="flex flex-col justify-center items-center w-full pt-16">
            <div className="flex bg-white/5 rounded-full p-4 mb-4">
              <img src={tokenLogo ? tokenLogo : "/logo.png"} alt="logo" className="w-8" />
            </div>
            <h1 className="text-sm font-bold mb-8">Send {tokenName || "Unknown Token"} {`(${tokenSymbol || "N/A"})`}</h1>
            <div className="relative w-full">
              <input
                type="text"
                name="to"
                className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="Receiver Public Address"
              />
              <button
                className="bg-primary p-1  absolute right-2 top-2 rounded-full"
                onClick={toogleDropdown}
              >
                <AtIcon size={14} weight="bold" className="text-gray-200" />
              </button>
              {
                isDropdownOpen && (
                  <div className="flex flex-col shadow border-0.5 border-white/5 absolute top-9 left-0 w-full mt-1 rounded bg-white/5 backdrop-blur-xs z-10 max-h-45 overflow-y-auto">
                    {
                      accountBook.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center px-3 py-1.5 cursor-pointer bg-white/5 hover:bg-white/10"
                          onClick={() => {
                            setToAddress(item.address);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span>{item.name}</span>
                          <span className="text-xs text-gray-500">{item.address.slice(0, 4)}...{item.address.slice(-4)}</span>
                        </div>
                      ))
                    }
                    {accountBook.length === 0 && (
                      <div className="px-3 py-1.5 text-center text-gray-500">
                        No saved addresses
                      </div>
                    )}
                  </div>
                )
              }
            </div>
            <input
              type="text"
              name="amount"
              className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
            disabled={!toAddress || !amount}
          >
            Confirm Send
            <CaretRightIcon size={14} weight="bold" className="text-gray-200" />
          </button>
        </div>
      </div>
    </SafeArea>
  )
}