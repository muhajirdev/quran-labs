import React from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface HopTraceProps {
    className?: string;
    step: 1 | 2 | 3 | 4;
}

export function HopTrace({ className, step }: HopTraceProps) {
    // We'll highlight nodes and connections based on the current step.
    const isStepActive = (s: number) => step >= s;

    return (
        <div className={cn("relative flex items-center justify-center min-w-[32px] min-h-[32px]", className)}>
            <motion.svg
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
            >
                {/*
          Nodes and Paths Layout:
          Node 1 (Top Left) -> Node 2 (Center Right) -> Node 3 (Bottom Left) -> Node 4 (Center, Golden)
        */}

                {/* --- EDGES --- */}
                {/* Edge 1 to 2 */}
                <motion.line
                    x1="15" y1="15" x2="45" y2="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(isStepActive(2) ? "text-accent" : "text-white/10")}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isStepActive(2) ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />
                {/* Edge 2 to 3 */}
                <motion.line
                    x1="45" y1="30" x2="20" y2="50"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(isStepActive(3) ? "text-accent" : "text-white/10")}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isStepActive(3) ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: isStepActive(3) && step === 3 ? 0 : 0 }}
                />
                {/* Edge 3 to 4 */}
                <motion.line
                    x1="20" y1="50" x2="30" y2="30"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={cn(isStepActive(4) ? "text-amber-400" : "text-white/10")}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isStepActive(4) ? 1 : 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: isStepActive(4) && step === 4 ? 0 : 0 }}
                />

                {/* --- NODES --- */}
                {/* Node 1 */}
                <motion.circle
                    cx="15" cy="15" r="4"
                    className={cn("fill-current", isStepActive(1) ? "text-accent" : "text-white/20")}
                    initial={false}
                    animate={{
                        scale: isStepActive(1) ? [1, 1.3, 1] : 1,
                    }}
                    transition={{ duration: 1, repeat: step === 1 ? Infinity : 0 }}
                />

                {/* Node 2 */}
                <motion.circle
                    cx="45" cy="30" r="4"
                    className={cn("fill-current", isStepActive(2) ? "text-accent" : "text-white/20")}
                    initial={false}
                    animate={{
                        scale: step === 2 ? [1, 1.3, 1] : 1,
                        opacity: isStepActive(2) ? 1 : 0.3
                    }}
                    transition={{ duration: 1, repeat: step === 2 ? Infinity : 0 }}
                />

                {/* Node 3 */}
                <motion.circle
                    cx="20" cy="50" r="4"
                    className={cn("fill-current", isStepActive(3) ? "text-accent" : "text-white/20")}
                    initial={false}
                    animate={{
                        scale: step === 3 ? [1, 1.3, 1] : 1,
                        opacity: isStepActive(3) ? 1 : 0.3
                    }}
                    transition={{ duration: 1, repeat: step === 3 ? Infinity : 0 }}
                />

                {/* Node 4 (The Reveal) */}
                <motion.circle
                    cx="30" cy="30" r="5" // Slightly larger
                    className={cn("fill-current", isStepActive(4) ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-white/20")}
                    initial={false}
                    animate={{
                        scale: step === 4 ? [1, 1.4, 1] : 1,
                        opacity: isStepActive(4) ? 1 : 0.3
                    }}
                    transition={{ duration: 1.5, repeat: step === 4 ? Infinity : 0 }}
                />

                {/* Pulsing ring around active node */}
                {step === 1 && (
                    <motion.circle cx="15" cy="15" r="8" className="stroke-accent fill-none" strokeWidth="1" animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
                {step === 2 && (
                    <motion.circle cx="45" cy="30" r="8" className="stroke-accent fill-none" strokeWidth="1" animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
                {step === 3 && (
                    <motion.circle cx="20" cy="50" r="8" className="stroke-accent fill-none" strokeWidth="1" animate={{ scale: [1, 1.5], opacity: [0.8, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
                {step === 4 && (
                    <motion.circle cx="30" cy="30" r="10" className="stroke-amber-400 fill-none" strokeWidth="1" animate={{ scale: [1, 1.8], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                )}

            </motion.svg>
        </div>
    );
}
