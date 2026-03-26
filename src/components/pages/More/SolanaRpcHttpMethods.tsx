import { useEffect, useState } from "react";
import { generateCurlCommands } from "../../../lib/utils/helper/curlCommandsGenerate";
import { useAccountStore } from "../../../store";
import ProfileAvatar from "../../ui/home/ProfileAvatar";
import SafeArea from "../../ui/layout/SafeArea";
import BackButton from "../../ui/util/BackButton";
import { CopyIcon, LinkIcon } from "@phosphor-icons/react";

export default function SolanaRpcHttpMethods() {
  const account = useAccountStore((state) => state.account);
  const [commands, setCommands] = useState<{ [key: string]: { curl: string; description: string } }>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (account) {
      const commands = generateCurlCommands(account.pubkey);
      setCommands(commands);
    }
  }, [account]);

  const copyToClipboard = async (command: string) => {
    await navigator.clipboard.writeText(command);
  };

  const viewInSolanDocs = (method: string) => {
    const cleanMethod = method.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const url = `https://solana.com/docs/rpc/http/${cleanMethod}`;
    window.open(url, "_blank");
  }

  return (
    <SafeArea>
      <div className="p-6">
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <BackButton />
          <ProfileAvatar account={account} accountLoading={false} />
        </div>

        <div>
          <input type="search"
            className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-4"
            placeholder="Search Commands ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          {Object.entries(commands)
            .filter(([key]) => key.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(([key, command]) => (
              <div key={key} className="bg-white/5 py-2 px-3 rounded flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm">{key}</h3>
                  <p className="text-xs text-gray-400">{command.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(command.curl)}
                  className="bg-white/5 p-1 rounded-lg copy"
                >
                  <CopyIcon size={16} className="text-gray-400" />
                </button>
              </div>
            ))}
        </div>

        <div className="bg-white/5 py-2 px-3 rounded flex justify-between items-start mt-4 cursor-pointer"
          onClick={() => viewInSolanDocs(searchTerm)}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-sm text-primary">{searchTerm ? searchTerm : "RPC HTTP Methods Docs"}</h3>
            <p className="text-xs text-gray-400">view in Solana docs</p>
          </div>
          <button
            className="bg-white/5 p-1 rounded-lg copy"
          >
            <LinkIcon size={16} className="text-gray-400" />
          </button>
        </div>


      </div>
    </SafeArea >
  )
}