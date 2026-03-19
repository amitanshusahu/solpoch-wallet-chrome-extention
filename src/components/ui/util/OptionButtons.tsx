import { CaretRightIcon } from "@phosphor-icons/react";

export default function OptionButtons({
  icon,
  label,
  onClick,
}: {
  icon?: React.ReactNode,
  label: string,
  onClick?: () => void,
}) {
  return (
    <div className="p-2 rounded-lg flex justify-between gap-4 bg-white/5 cursor-pointer hover:bg-white/10 mb-1" onClick={onClick}>
      <div className="flex gap-2 justify-center items-center">
        {icon}
        <span className="text-sm text-gray-300 font-semibold">{label}</span>
      </div>
      <CaretRightIcon size={13} weight="bold" className="text-gray-300" />
    </div>
  )
}