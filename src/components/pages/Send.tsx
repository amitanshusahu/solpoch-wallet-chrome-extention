import { useState } from "react"
import SafeArea from "../ui/layout/SafeArea"
import ProfileAvatar from "../ui/home/ProfileAvatar"
import { CaretLeftIcon } from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"
import { useAccountStore } from "../../store"
import SendForm from "../ui/send/SendForm"
import ConfirmSend from "../ui/send/ConfirmSend"

export default function Send() {
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
    <SendForm
      amount={amount}
      setAmount={setAmount}
      toAddress={toAddress}
      setToAddress={setToAddress}
      goNextStep={goNextStep}
    />,
    <ConfirmSend
      amount={amount}
      toAddress={toAddress}
    />
  ]


  return (
    <SafeArea>
      <div className="p-6 h-full">
        <div className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-center">
            <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center" onClick={() => navigate(-1)}>
              <CaretLeftIcon size={16} weight="bold" className="text-gray-200" />
            </button>
            <ProfileAvatar account={account} accountLoading={false} />
          </div>
          {
            steps[currentStep]
          }
        </div>
      </div>
    </SafeArea>
  )
}