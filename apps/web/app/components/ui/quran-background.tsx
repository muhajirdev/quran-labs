import React from "react";

interface QuranBackgroundProps {
  children: React.ReactNode;
}

export function QuranBackground({ children }: QuranBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-black to-black"></div>

      {/* Radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-900/10 to-transparent"></div>

      {/* Subtle noise texture */}
      <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-[0.03]"></div>

      {/* Glowing orb effect */}
      <div className="absolute top-[-150px] right-[-150px] w-[300px] h-[300px] rounded-full bg-primary/5 blur-[100px]"></div>
      <div className="absolute bottom-[-180px] left-[-180px] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px]"></div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-repeat opacity-[0.02]"></div>

      {/* Top highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col h-screen text-white">
        {children}
      </div>
    </div>
  );
}
