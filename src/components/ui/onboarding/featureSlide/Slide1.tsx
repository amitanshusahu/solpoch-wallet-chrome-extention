export default function Slide1() {
  return (
    <div className="flex flex-col gap-1 h-full pb-4">
      <div className="h-full flex justify-center items-center">
        <StaggeringCard />
      </div>
      <h2 className="text-lg text-white text-center">Solana Wallet Built for Builders</h2>
      <p className="text-xs text-gray-400 text-center px-10">
       See every byte. Simulate every instruction.
Debug faster. Build better.
      </p>
    </div>
  );
}

function StaggeringCard() {
  return (
    <div className="relative w-72 h-44" style={{ perspective: "800px" }}>
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          transform: "translateY(-24px) scale(0.88)",
          zIndex: 1,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      />

      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #1c1c30 0%, #18192e 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          transform: "translateY(-12px) scale(0.94)",
          zIndex: 2,
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        }}
      />

      <div
        className="absolute inset-0 rounded-2xl overflow-hidden"
        style={{
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.14)",
          zIndex: 3,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* purple blob */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "65%",
            height: "140%",
            background:
              "radial-gradient(ellipse at center, rgba(89, 84, 252,0.75) 0%, rgba(58, 55, 166,0.45) 40%, transparent 70%)",
            filter: "blur(28px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-5">
          <div className="flex justify-between items-start">
            <div className="uppercase text-sm font-bold text-white">sol</div>
            <span className="text-white font-bold text-lg">
              solpoch
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-white font-semibold" style={{ fontSize: "18px" }}>
              3124 SOL
            </span>
            <span className="text-gray-400 text-xs tracking-widest">
              0xA1b29f4ciojkl2...9f4c1e5d
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex justify-between items-end">
            <span className="text-gray-300 text-xs">10 compute units</span>
            <span className="text-gray-300 text-xs"> devnet </span>
          </div>
        </div>
      </div>
    </div>
  );
}