import { CheckIcon, XIcon } from "@phosphor-icons/react";

export default function ConfirmSend({
  amount,
  toAddress,
}: {
  amount: string,
  toAddress: string,
}) {
  return (
    <>
      <div className="flex flex-col justify-center items-center h-full">
        <h1 className="text-sm font-bold mb-4">Confirm Send</h1>
        <div className="mb-12">
          <img src="/solana-logo.png" alt="Solana Logo" className="h-10 w-10" />
        </div>
        <div className="w-full bg-white/5 p-4 rounded-lg flex flex-col">
          <div className="flex justify-between w-full gap-4">
            <span className="text-xs text-gray-400">To</span>
            <span className="text-xs text-gray-200">{toAddress}</span>
          </div>
          <div className="flex justify-between w-full gap-4 border-t border-bg mt-2 pt-2 border-b mb-2 pb-2">
            <span className="text-xs text-gray-400">Amount</span>
            <span className="text-xs text-gray-200">{amount} SOL</span>
          </div>
          <div className="flex justify-between w-full gap-4">
            <span className="text-xs text-gray-400">Cluster</span>
            <span className="text-xs text-gray-200">Devnet</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          // onClick={goNextStep}
          className="px-4 py-2 bg-white/10 rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
          disabled={!toAddress || !amount}
        >
          <XIcon size={14} weight="bold" className="text-gray-200" />
          Cancel
        </button>
        <button
          // onClick={goNextStep}
          className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
          disabled={!toAddress || !amount}
        >
          <CheckIcon size={14} weight="bold" className="text-gray-200" />
          Send
        </button>
      </div>
    </>
  )
}