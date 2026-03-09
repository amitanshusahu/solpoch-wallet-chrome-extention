export default function SimulatingOverlay() {
  return (
    <div className="flex flex-col justify-center items-center h-full gap-4">
      <div className="relative">
        <div className="border-t-2 border-primary rounded-full animate-spin">
          <div className="h-16 w-16" />
        </div>
        <img
          src="/logo.png"
          alt="logo"
          className="h-8 w-8 absolute top-4 left-4"
        />
      </div>
      <p className="text-xs text-gray-400">Simulating transaction…</p>
    </div>
  );
}