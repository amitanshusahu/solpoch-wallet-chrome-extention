export default function PopCard({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <div className="pop-outer">
      <div className="pop-inner">
        {children}
      </div>
    </div>
  )
}