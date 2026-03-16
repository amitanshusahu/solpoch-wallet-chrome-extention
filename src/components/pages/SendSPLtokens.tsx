import { useState } from "react"
import SafeArea from "../ui/layout/SafeArea"
import ProfileAvatar from "../ui/home/ProfileAvatar"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import { useAccountStore } from "../../store"
import SendTokenForm from "../ui/sendSPLtokens/SendTokenForm"
import ConfirmSendSplToken from "../ui/sendSPLtokens/ConfirmSendSplToken"

export default function SendSplTokens() {
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')

  const account = useAccountStore((state) => state.account);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const goNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  const steps = [
    <SendTokenForm
      amount={amount}
      setAmount={setAmount}
      toAddress={toAddress}
      setToAddress={setToAddress}
      goNextStep={goNextStep}
    />,
    <ConfirmSendSplToken
      amount={amount}
      toAddress={toAddress}
    />
  ]


  return (
    <SafeArea>
      <div className="flex flex-col h-full p-6">
        {/* header */}
        <div className="flex justify-between items-center sticky top-0 z-10 bg-transparent backdrop-blur-sm pb-6">
          <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center" onClick={() => navigate(-1)}>
            <CaretLeftIcon size={16} weight="bold" className="text-gray-200" />
          </button>
          <ProfileAvatar account={account} accountLoading={false} />
        </div>
        {/* body */}
        {
          steps[currentStep]
        }
      </div>
    </SafeArea>
  )
}