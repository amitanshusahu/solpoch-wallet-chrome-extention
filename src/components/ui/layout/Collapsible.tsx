import { CaretRightIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type CollapsibleProps = {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
};

export default function Collapsible({
  title,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className = "",
  headerClassName = "",
  contentClassName = "",
  disabled = false,
}: CollapsibleProps) {
  const isControlled = useMemo(() => open !== undefined, [open]);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!isControlled) {
      setInternalOpen(defaultOpen);
    }
  }, [defaultOpen, isControlled]);

  const isOpen = isControlled ? Boolean(open) : internalOpen;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors ${
          disabled ? "cursor-not-allowed opacity-60" : "hover:bg-white/5"
        } ${headerClassName}`}
      >
        <div className="min-w-0 flex-1 text-left">{title}</div>
        <CaretRightIcon
          size={12}
          weight="bold"
          className={`text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>

      {isOpen && <div className={contentClassName}>{children}</div>}
    </div>
  );
}