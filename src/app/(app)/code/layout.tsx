export default function CodeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
        <div className="h-full w-full">{children}</div>
    </div>
  )
}
