import { useNavigate, useParams } from "react-router-dom"
import SafeArea from "../ui/layout/SafeArea";
import { useAccountStore } from "../../store";
import { RpcService } from "../../lib/rpc";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import { ArrowDownLeftIcon, ArrowUpRightIcon, ClockCounterClockwiseIcon, LinkIcon } from "@phosphor-icons/react";
import BackButton from "../ui/util/BackButton";
import SectionCard from "../ui/popup/signAndSendTransaction/SectionCard";
import Row from "../ui/popup/signAndSendTransaction/Row";
import AddressCopyButton from "../ui/util/AddressWithCopyButton";
import { useQuery } from "@tanstack/react-query";

export default function TokenInfo() {
  const param = useParams();
  const mintAddressBase58 = param.mint;

  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  const ataInfoQuery = useQuery({
    queryKey: ["ataInfo", account?.pubkey.toString(), mintAddressBase58],
    queryFn: async () => {
      if (!account || !mintAddressBase58) return null;
      const ata = await RpcService.getAssociatedTokenAccountInfo(account.pubkey, mintAddressBase58);
      return ata;
    },
    enabled: !!account && !!mintAddressBase58,
  })

  const mintInfoQuery = useQuery({
    queryKey: ["mintInfo", mintAddressBase58],
    queryFn: async () => {
      if (!mintAddressBase58) return null;
      const mintInfo = await RpcService.getMintTokenInfo(mintAddressBase58);
      return mintInfo;
    }
  })

  const handleSendClick = () => {
    navigate(`/tokens/send/${mintAddressBase58}?name=${mintInfoQuery.data ? mintInfoQuery.data.name : "Unknown Token"}&logo=${mintInfoQuery.data && mintInfoQuery.data.image ? mintInfoQuery.data.image : ""}&symbol=${mintInfoQuery.data ? mintInfoQuery.data.symbol : ""}&decimals=${mintInfoQuery.data ? mintInfoQuery.data.decimals : ""}`);
  }

  return (
    <SafeArea>
      <div>
        <div className="bg-img p-6">
          <div className="flex items-center justify-between">
            <BackButton />
            <ProfileAvatar account={account} accountLoading={false} />
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="mt-6 flex flex-col items-center justify-center">
              <h3 className="text-xs text-gray-300 mb-2">Total Balance</h3>
              <h1 className="text-5xl font-semibold text-center">{ataInfoQuery.data ? ataInfoQuery.data.balance : "0.00"} {mintInfoQuery.data && mintInfoQuery.data.symbol ? mintInfoQuery.data.symbol : "N/A"}</h1>
              <p className="text-sm text-gray-400 mt-2">{mintInfoQuery.data && mintInfoQuery.data.name ? mintInfoQuery.data.name : "Unknown Token"}</p>
            </div>

            <div className="mt-6 flex gap-4 flex-wrap">
              <div className="flex flex-col justify-center items-center">
                <button
                  className="flex bg-white/20 text-sm rounded-full justify-center items-center w-16 h-16 inset-top-light"
                  onClick={handleSendClick}
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
                  onClick={() => navigate("/recieve")}
                >
                  <ClockCounterClockwiseIcon size={24} weight="bold" className="mr-1" />
                </button>
                <span className="text-xs mt-1 text-gray-400">History</span>
              </div>
            </div>
          </div>

        </div>

        <div className="flex flex-col p-6 pt-0">
          <h2 className="text-sm text-gray-300 py-2 pt-6">ATA Information</h2>
          <SectionCard>
            <Row
              label=" Associated Token Account"
              value={ataInfoQuery.data && ataInfoQuery.data.tokenAccount ? <AddressCopyButton addressToCopy={ataInfoQuery.data.tokenAccount} /> : "N/A"}
              accent="green"
            />
          </SectionCard>

          <h2 className="text-sm text-gray-300 py-2 pt-6">Token Mint Information</h2>
          <SectionCard>
            <Row
              label="Mint Address"
              value={mintInfoQuery.data && mintInfoQuery.data.mintAddress ? <AddressCopyButton addressToCopy={mintInfoQuery.data.mintAddress} /> : "N/A"}
              icon={mintInfoQuery.data && mintInfoQuery.data.image ? <img src={mintInfoQuery.data.image} alt={`${mintInfoQuery.data.name} logo`} className="w-3 h-3 rounded-full" /> : undefined}
            />
            <Row
              label="Name"
              value={mintInfoQuery.data && mintInfoQuery.data.name ? mintInfoQuery.data.name : "N/A"}
            />
            <Row
              label="Symbol"
              value={mintInfoQuery.data && mintInfoQuery.data.symbol ? mintInfoQuery.data.symbol : "N/A"}
            />
            <Row
              label="Decimals"
              value={mintInfoQuery.data && mintInfoQuery.data.decimals ? mintInfoQuery.data.decimals : "N/A"}
            />
            <Row
              label="Supply"
              value={mintInfoQuery.data && mintInfoQuery.data.supply ? mintInfoQuery.data.supply : "N/A"}
            />
            <Row
              label="Mint Authority"
              value={mintInfoQuery.data && mintInfoQuery.data.mintAuthority ? <AddressCopyButton addressToCopy={mintInfoQuery.data.mintAuthority} /> : "N/A"}
            />
            <Row
              label="Freeze Authority"
              value={mintInfoQuery.data && mintInfoQuery.data.freezeAuthority ? <AddressCopyButton addressToCopy={mintInfoQuery.data.freezeAuthority} /> : "N/A"}
            />
            <Row
              label="Metadata"
              value={mintInfoQuery.data && mintInfoQuery.data.metadata ? <AddressCopyButton addressToCopy={mintInfoQuery.data.metadata} /> : "N/A"}
              icon={<LinkIcon size={12} className="text-gray-400" />}
            />
          </SectionCard>
        </div>

      </div>
    </SafeArea>
  )
}