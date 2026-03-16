import { CopyIcon } from "@phosphor-icons/react";

export default function AddressCopyButton({ addressToCopy }: { addressToCopy: string }) {
  const handleCopyKey = async (copyString: string) => {
    await navigator.clipboard.writeText(copyString);
  };
  return (
    <div className="flex justify-center items-center gap-2">
      <button onClick={() => handleCopyKey(addressToCopy)} className="text-xs">
        <CopyIcon size={14} className="text-gray-200" />
      </button>
      <span className="text-xs">{addressToCopy.slice(0, 6)}...{addressToCopy.slice(-4)}</span>
    </div>
  )
}