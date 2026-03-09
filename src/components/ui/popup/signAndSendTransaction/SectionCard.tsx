export default function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/4 border border-white/7 overflow-hidden">
      {children}
    </div>
  );
}