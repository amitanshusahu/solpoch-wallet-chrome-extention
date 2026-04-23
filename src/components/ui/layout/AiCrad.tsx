import { useEffect, useState } from "react";
import PopCard from "./PopCard";

export default function AiCrad({
  loading,
  content,
}: {
  loading: boolean;
  content: string;
}) {
  const loadingContent = ["Thinking...", "Analyzing...", "Processing...", "Generating insights...", "Crunching data...", "Formulating response...", "Synthesizing information...", "Evaluating transaction...", "Interpreting logs...", "Decoding instructions...", "Assessing impact...", "Identifying patterns...", "Drawing conclusions...", "Calculating probabilities...", "Reviewing history...", "Comparing similar transactions..."];
  const [loadingText, setLoadingText] = useState("Thinking...");

  useEffect(() => {
    let timeOutId: ReturnType<typeof setInterval> | undefined;

    if (loading) {
      timeOutId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * loadingContent.length);
        setLoadingText(loadingContent[randomIndex]);
      }, 2000);
    }

    return () => {
      if (timeOutId) {
        clearInterval(timeOutId);
      }
    };
  }, [loading]);

  return (
    <PopCard>
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <div className="w-[14px] h-[14px]">
              <img src="/ai.png" alt="AI Logo" className="w-[14px] h-[14px]" />
            </div>
            <h3 className="font-bold text-xs">AI Insight</h3>
          </div>
          <p className="text-xs text-gray-300">
            {loading ? loadingText : content}
          </p>
        </div>
        <div className="w-fit pop-button h-fit p-3 rounded-full">
          <div className="w-[24px] h-[24px]">
            <img src="/ai.png" alt="AI Logo" className="w-[24px] h-[24px]" />
          </div>
        </div>
      </div>
    </PopCard>
  )
}