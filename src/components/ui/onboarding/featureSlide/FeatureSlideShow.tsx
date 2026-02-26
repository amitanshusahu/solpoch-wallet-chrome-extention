import { useState } from "react";
import Slide1 from "./Slide1"

export default function FeatureSlideShow({
  goNextStep
}: {
  goNextStep: () => void
}) {
  const slides = [<Slide1 />];
  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (currentSlide === slides.length - 1) {
      goNextStep();
    }
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-bg p-8 bg-img">
      <div className="w-fit h-fit mt-10">
        <img src="/logo-long.png" alt="Solpoch Logo" className="h-[24px]"/>
      </div>
      <div className="h-full">
        {slides[currentSlide]}
      </div>
      <button
        onClick={handleNext}
        className="px-4 py-2 bg-primary rounded-full text-white font-semibold w-[80%] text-center text-xs inset-top"
      >
        Continue
      </button>
    </div>
  )
}