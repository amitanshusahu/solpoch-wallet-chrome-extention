import { useState } from "react";
import FeatureSlideShow from "../ui/onboarding/featureSlide/FeatureSlideShow";
import SafeArea from "../ui/layout/SafeArea";
import Mnemonics from "../ui/onboarding/Mnemonics";
import UnlockSetup from "../ui/onboarding/UnlockSetup";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const goNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    if (currentStep === steps.length - 1) {
      navigate("/");
    }
  }
  const steps = [<FeatureSlideShow goNextStep={goNextStep} />, <UnlockSetup goNextStep={goNextStep} setPassword={setPassword} password={password} />, <Mnemonics goNextStep={goNextStep} password={password} />];
  const [currentStep, setCurrentStep] = useState(0);
  const CurrentStepComponent = steps[currentStep];

  return (
    <SafeArea>
      {
        CurrentStepComponent
      }
    </SafeArea>
  )
}