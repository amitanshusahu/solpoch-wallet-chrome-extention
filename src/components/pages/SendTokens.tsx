import { useParams, useSearchParams } from "react-router-dom"
import SafeArea from "../ui/layout/SafeArea";

export default function SendTokens() {
  const param = useParams();
  const [searchParams] = useSearchParams();
  const tokenName = searchParams.get("name");
  const tokenLogo = searchParams.get("logo");
  const tokenSymbol = searchParams.get("symbol");
  const mintAddressBase58 = param.mint;

  return (
    <SafeArea>
      <div>
        <h1 className="text-2xl font-bold">Send {tokenName}</h1>
        <p className="text-sm text-gray-500">Mint Address: {mintAddressBase58}</p>
        <p>{tokenName} is a token on the Solana blockchain.</p>
        <p>{tokenSymbol}</p>
        {tokenLogo && <img src={tokenLogo} alt={`${tokenName} logo`} className="w-16 h-16" />}
      </div>
    </SafeArea>
  )
}