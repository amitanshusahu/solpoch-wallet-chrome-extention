export default function Row({
  label,
  value,
  icon,
  mono,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
  accent?: "red" | "green" | "neutral";
}) {
  const valueColor =
    accent === "red"
      ? "text-red-400"
      : accent === "green"
      ? "text-green-400"
      : "text-gray-200";
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/5 last:border-b-0">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-gray-500 shrink-0">{icon}</span>}
        <span className="text-xs text-gray-400 truncate">{label}</span>
      </div>
      <span
        className={`text-xs font-medium shrink-0 ${valueColor} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
