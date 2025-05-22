import React from "react";
import { GeometricDecoration } from "./geometric-background";
import { Logo } from "./logo";
import { cn } from "~/lib/utils";

interface LoadingScreenProps {
  message?: string;
  stage?: number;
}

export function LoadingScreen({
  message = "Loading AI Experience...",
  stage = 0
}: LoadingScreenProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] relative transition-all duration-300">
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Main content - Centered with padding for fixed header - Mobile friendly */}
      <main className="flex-1 flex flex-col justify-center overflow-hidden pt-12 pb-20 sm:pb-24">
        <div className="flex flex-col items-center transition-all duration-500 ease-in-out px-3 sm:px-6 opacity-100 mb-10 sm:mb-16">
          {/* Enhanced logo with detailed geometric pattern and animations */}
          <div className="mb-10 relative">
            {/* Outer glow effect with enhanced animation */}
            <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full transform scale-110 opacity-40 animate-[pulse_4s_ease-in-out_infinite]"></div>

            {/* Secondary glow with offset animation */}
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full transform scale-125 opacity-30 animate-[pulse_6s_ease-in-out_infinite_1s]"></div>

            {/* Main logo container with hover effect - Mobile friendly */}
            <div className="relative p-4 sm:p-5 rounded-full shadow-lg transition-all duration-300 overflow-hidden group">
              {/* Crescent logo with pulse animation */}
              <div className="h-16 w-16 sm:h-20 sm:w-20 animate-pulse">
                <Logo size="lg" className="w-full h-full" />
              </div>
            </div>
          </div>

          <div className="relative mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white relative z-10">
              SuperQuran
            </h1>
            {/* Title decoration */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 opacity-60" style={{
              backgroundImage: `url(/images/title-decoration.svg)`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}></div>
          </div>

          {/* Loading indicator with progress */}
          <div className="flex flex-col items-center mt-8">
            {/* Animated dots */}
            <div className="flex space-x-2 mb-4">
              <div className={cn(
                "w-2 h-2 rounded-full bg-accent/80",
                "animate-[bounce_1.4s_ease-in-out_infinite]"
              )} />
              <div className={cn(
                "w-2 h-2 rounded-full bg-accent/80",
                "animate-[bounce_1.4s_ease-in-out_0.2s_infinite]"
              )} />
              <div className={cn(
                "w-2 h-2 rounded-full bg-accent/80",
                "animate-[bounce_1.4s_ease-in-out_0.4s_infinite]"
              )} />
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-accent/50 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(stage * 25, 100)}%`,
                  opacity: stage > 0 ? 1 : 0.3
                }}
              />
            </div>

            {/* Loading message */}
            <p className="text-white/50 text-sm">{message}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
