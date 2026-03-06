import { CaretRightIcon } from "@phosphor-icons/react";

export default function SendForm({
  amount,
  setAmount,
  toAddress,
  setToAddress,
  goNextStep,
}: {
  amount: string,
  setAmount: (amount: string) => void,
  toAddress: string,
  setToAddress: (toAddress: string) => void,
  goNextStep: () => void,
}) {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full">
        <div className="mb-4">
          <img src="/solana-logo.png" alt="Solana Logo" className="h-10 w-10" />
        </div>
        <h1 className="text-sm font-bold mb-8">Send SOL</h1>
        <input
          type="text"
          name="to"
          className="w-full px-3 py-1.5 rounded bg-white/5 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="Receiver Public Address"
        />
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
        onClick={goNextStep}
        className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-full text-xs inset-top mt-3 disabled:bg-primary/50 flex gap-2 justify-center items-center"
        disabled={!toAddress || !amount}
      >
        Continue
        <CaretRightIcon size={14} weight="bold" className="text-gray-200" />
      </button>
    </>
  )
}