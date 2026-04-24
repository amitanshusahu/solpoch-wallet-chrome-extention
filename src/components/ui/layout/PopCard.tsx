export default function PopCard({
  children,
  loading = false,
}: {
  children?: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="pop-outer">
      <div className={`pop-inner ${loading ? 'pop-loading' : ''}`}>
        {children}
      </div>
    </div>
  )
}