import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../../store";
import { CaretRightIcon, InfoIcon } from "@phosphor-icons/react";
import { RpcService } from "../../../lib/rpc";
import { useQuery } from "@tanstack/react-query";

export default function TokenList() {

  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  const tokensQuery = useQuery({
    queryKey: ["tokens", account?.pubkey.toString()],
    queryFn: async () => {
      if (!account) return [];
      const tokens = await RpcService.getTokenList(account.pubkey);
      console.log("Fetched tokens:", tokens);
      return tokens;
    },
    staleTime: 10 * 60 * 1000, // 5 minutes
  })

  if (tokensQuery.isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-sm text-gray-300">Tokens</h2>
        <div className="rounded bg-primary/20 p-4 mt-4 flex gap-2">
          <div><InfoIcon size={12} weight="fill" className="text-primary animate-pulse" /></div>
          <h3 className="text-xs">Loading your tokens...</h3>
        </div>
      </div>
    )
  }

  if (tokensQuery.data?.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-sm text-gray-300">Tokens</h2>
        <div className="rounded bg-primary/20 p-4 mt-4 flex gap-2">
          <div><InfoIcon size={12} weight="fill" className="text-primary" /></div>
          <h3 className="text-xs">No tokens found in your wallet yet. Your SPL tokens will appear here once you receive them.</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-2">
      <h2 className="text-sm text-gray-300">Tokens</h2>

      {/* <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">A</div>
          <div>
            <h3 className="text-sm">Amit Coin</h3>
            <p className="text-xs text-gray-500">0.00</p>
          </div>
        </div>
        <button
          className="p-2 rounded-full bg-white/10"
          onClick={() => navigate("/tokens/amit-coin")}
        >
          <CaretRightIcon size={14} weight="bold" className="text-gray-300" />
        </button>
      </div> */}

      {
        tokensQuery.data?.map((t, index) => (
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg" key={index}>
            <div className="flex items-center gap-2">
              {/* <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">A</div> */}
              {
                t.metadata && t.metadata.json && t.metadata.json.image ? (
                  <img src={t.metadata.json.image} alt={t.metadata.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm uppercase">
                    {t.metadata ? t.metadata.symbol[0] : "?"}
                  </div>
                )
              }
              <div>
                <h3 className="text-sm">{t.metadata ? t.metadata.name : "Unknown Token"}</h3>
                <p className="text-xs text-gray-500">{t.balance ? t.balance.toString() : "0.00"}{t.metadata && t.metadata.json ? t.metadata.json.symbol : ""}</p>
              </div>
            </div>
            <button
              className="p-2 rounded-full bg-white/10"
              onClick={() => navigate(`/token/${t.mint}`)}
            >
              <CaretRightIcon size={14} weight="bold" className="text-gray-300" />
            </button>
          </div>
        ))
      }

    </div>
  )
}