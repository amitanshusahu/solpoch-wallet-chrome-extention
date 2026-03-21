import { CaretRightIcon } from "@phosphor-icons/react";

export default function OptionButtons({
  icon,
  label,
  onClick,
  type = "normal"
}: {
  icon?: React.ReactNode,
  label: string,
  onClick?: () => void,
  type?: "normal" | "danger" | "warning"
}) {
  return (
    <div className={`p-2 rounded-lg flex justify-between gap-4 cursor-pointer hover:bg-white/10 mb-1 ${type === "danger" ? "bg-red-500/20 hover:bg-red-500/30" : type === "warning" ? "bg-yellow-500/20 hover:bg-yellow-500/30" : "bg-white/5 hover:bg-white/10"}`} onClick={onClick}>
      <div className={`flex gap-2 justify-center items-center ${type === "danger" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-gray-300"}`}>
        {icon}
        <span className={`text-sm text-gray-300 font-semibold ${type === "danger" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-gray-300"}`}>{label}</span>
      </div>
      <CaretRightIcon size={13} weight="bold" className={`text-gray-300 ${type === "danger" ? "text-red-400" : type === "warning" ? "text-yellow-400" : "text-gray-300"}`} />
    </div>
  )
}