export default function SafeArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-100 h-150 mx-auto">
      {children}
    </div>
  )
}