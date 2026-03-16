import { useNavigate, useParams } from "react-router-dom"
import SafeArea from "../ui/layout/SafeArea";
import { useAccountStore } from "../../store";
import { useEffect, useState } from "react";
import { RpcService } from "../../lib/rpc";
import ProfileAvatar from "../ui/home/ProfileAvatar";
import { ArrowDownLeftIcon, ArrowUpRightIcon, ClockCounterClockwiseIcon, LinkIcon } from "@phosphor-icons/react";
import BackButton from "../ui/util/BackButton";
import SectionCard from "../ui/popup/signAndSendTransaction/SectionCard";
import Row from "../ui/popup/signAndSendTransaction/Row";
import AddressCopyButton from "../ui/util/AddressWithCopyButton";

export default function TokenInfo() {
  const param = useParams();
  const mintAddressBase58 = param.mint;

  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  const [ATAInfo, ATAAccountInfo] = useState<{
    mint: any;
    balance: any;
    decimals: any;
    tokenAccount: string;
  } | null>(null);
  const [mintInfo, setMintInfo] = useState<{
    mintAddress: string;
    name: string | null;
    symbol: string | null;
    uri: string | null;
    image: any;
    description: any;
    decimals: number;
    supply: string;
    mintAuthority: string | null;
    freezeAuthority: string | null;
    metadata: any;
  } | null>(null);

  useEffect(() => {
    async function fetchATA() {
      if (!account || !mintAddressBase58) return;
      const ata = await RpcService.getAssociatedTokenAccountInfo(account.pubkey, mintAddressBase58);
      ATAAccountInfo(ata);
    }

    if (!ATAInfo) {
      fetchATA();
    }
  }, [account, mintAddressBase58]);

  useEffect(() => {
    async function fetchMintInfo() {
      if (!mintAddressBase58) return;
      const mintInfo = await RpcService.getMintTokenInfo(mintAddressBase58);
      setMintInfo(mintInfo);
    }

    if (!mintInfo) {
      fetchMintInfo();
    }
  }, [mintAddressBase58]);

  const handleSendClick = () => {
    navigate(`/tokens/send/${mintAddressBase58}?name=${mintInfo ? mintInfo.name : "Unknown Token"}&logo=${mintInfo && mintInfo.image ? mintInfo.image : ""}&symbol=${mintInfo ? mintInfo.symbol : ""}`);
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
              <h1 className="text-5xl font-semibold">{ATAInfo ? ATAInfo.balance : "0.00"} {mintInfo && mintInfo.symbol ? mintInfo.symbol : "NA"}</h1>
              <p className="text-sm text-gray-400 mt-2">{mintInfo && mintInfo.name ? mintInfo.name : "Unknown Token"}</p>
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
              value={ATAInfo && ATAInfo.tokenAccount ? <AddressCopyButton addressToCopy={ATAInfo.tokenAccount} /> : "NA"}
              accent="green"
            />
          </SectionCard>

          <h2 className="text-sm text-gray-300 py-2 pt-6">Token Mint Information</h2>
          <SectionCard>
            <Row
              label="Mint Address"
              value={mintInfo && mintInfo.mintAddress ? <AddressCopyButton addressToCopy={mintInfo.mintAddress} /> : "NA"}
              icon={mintInfo && mintInfo.image ? <img src={mintInfo.image} alt={`${mintInfo.name} logo`} className="w-3 h-3 rounded-full" /> : undefined}
            />
            <Row
              label="Name"
              value={mintInfo && mintInfo.name ? mintInfo.name : "NA"}
            />
            <Row
              label="Symbol"
              value={mintInfo && mintInfo.symbol ? mintInfo.symbol : "NA"}
            />
            <Row
              label="Decimals"
              value={mintInfo && mintInfo.decimals ? mintInfo.decimals : "NA"}
            />
            <Row
              label="Supply"
              value={mintInfo && mintInfo.supply ? mintInfo.supply : "NA"}
            />
            <Row
              label="Mint Authority"
              value={mintInfo && mintInfo.mintAuthority ? <AddressCopyButton addressToCopy={mintInfo.mintAuthority} /> : "NA"}
            />
            <Row
              label="Freeze Authority"
              value={mintInfo && mintInfo.freezeAuthority ? <AddressCopyButton addressToCopy={mintInfo.freezeAuthority} /> : "NA"}
            />
            <Row
              label="Metadata"
              value={mintInfo && mintInfo.metadata ? <AddressCopyButton addressToCopy={mintInfo.metadata} /> : "NA"}
              icon={<LinkIcon size={12} className="text-gray-400" />}
            />
          </SectionCard>
        </div>

      </div>
    </SafeArea>
  )
}