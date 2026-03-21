import { CopyIcon } from "@phosphor-icons/react";

export default function AddressCopyButton({ addressToCopy, flip = true }: { addressToCopy: string; flip?: boolean }) {
  const handleCopyKey = async (copyString: string) => {
    await navigator.clipboard.writeText(copyString);
  };
  if (flip) {
    return (
      <div className="flex justify-center items-center gap-2">
        <span className="text-xs">{addressToCopy.slice(0, 6)}...{addressToCopy.slice(-4)}</span>
        <button onClick={() => handleCopyKey(addressToCopy)} className="text-xs copy">
          <CopyIcon size={14} className="text-gray-200" />
        </button>
      </div>
    )
  }
  return (
    <div className="flex justify-center items-center gap-2">
      <button onClick={() => handleCopyKey(addressToCopy)} className="text-xs copy">
        <CopyIcon size={14} className="text-gray-200" />
      </button>
      <span className="text-xs">{addressToCopy.slice(0, 6)}...{addressToCopy.slice(-4)}</span>
    </div>
  )
}