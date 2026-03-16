import { CaretLeftIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function BackButton({
  goBack
}: {
  goBack?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <button className="flex bg-white/10 items-center gap-1 rounded-full p-2 justify-center" onClick={() => goBack ? goBack() : navigate(-1)}>
      <CaretLeftIcon size={16} weight="bold" className="text-gray-200" />
    </button>
  )
}