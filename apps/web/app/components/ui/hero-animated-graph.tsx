import React from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface HeroAnimatedGraphProps {
    className?: string;
}

export function HeroAnimatedGraph({ className }: HeroAnimatedGraphProps) {
    return (
        <div className={cn("relative flex items-center justify-center pointer-events-none", className)}>
            {/* Central Verse Node Glow */}
            <motion.div
                className="absolute w-24 h-24 bg-accent/20 rounded-full blur-2xl"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />

            {/* Outer Web Glow */}
            <motion.div
                className="absolute w-64 h-64 border border-accent/10 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 6,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 1,
                }}
            />
            <motion.div
                className="absolute w-96 h-96 border border-accent/5 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.05, 0.2, 0.05],
                }}
                transition={{
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: 2,
                }}
            />

            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-accent"
            >
                {/* Core Verse Node */}
                <motion.circle
                    cx="100"
                    cy="100"
                    r="6"
                    fill="currentColor"
                    className="drop-shadow-[0_0_12px_currentColor]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Level 1 Connections (Immediate Context) */}
                {[
                    { cx: 70, cy: 60 },
                    { cx: 140, cy: 80 },
                    { cx: 120, cy: 150 },
                    { cx: 60, cy: 130 },
                ].map((pos, i) => (
                    <g key={`l1-${i}`}>
                        <motion.line
                            x1="100"
                            y1="100"
                            x2={pos.cx}
                            y2={pos.cy}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeOpacity="0.6"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 + i * 0.2, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx={pos.cx}
                            cy={pos.cy}
                            r="4"
                            fill="currentColor"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.8, delay: 1.5 + i * 0.2 }}
                        />
                    </g>
                ))}

                {/* Level 2 Connections (Broader Web) */}
                {[
                    // From L1 Node 1 (70, 60)
                    { from: { x: 70, y: 60 }, to: { x: 40, y: 30 } },
                    { from: { x: 70, y: 60 }, to: { x: 90, y: 20 } },

                    // From L1 Node 2 (140, 80)
                    { from: { x: 140, y: 80 }, to: { x: 180, y: 60 } },
                    { from: { x: 140, y: 80 }, to: { x: 170, y: 110 } },

                    // From L1 Node 3 (120, 150)
                    { from: { x: 120, y: 150 }, to: { x: 160, y: 180 } },
                    { from: { x: 120, y: 150 }, to: { x: 90, y: 190 } },

                    // From L1 Node 4 (60, 130)
                    { from: { x: 60, y: 130 }, to: { x: 20, y: 150 } },
                    { from: { x: 60, y: 130 }, to: { x: 30, y: 90 } },
                ].map((link, i) => (
                    <g key={`l2-${i}`}>
                        <motion.line
                            x1={link.from.x}
                            y1={link.from.y}
                            x2={link.to.x}
                            y2={link.to.y}
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeOpacity="0.3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, delay: 2 + i * 0.1, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx={link.to.x}
                            cy={link.to.y}
                            r="2.5"
                            fill="currentColor"
                            fillOpacity="0.7"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 3.5 + i * 0.1 }}
                        />
                    </g>
                ))}

                {/* Floating Ambient Particles (Deep Context) */}
                {[
                    { cx: 160, cy: 30 }, { cx: 20, cy: 50 }, { cx: 40, cy: 180 }, { cx: 180, cy: 150 }
                ].map((pos, i) => (
                    <motion.circle
                        key={`ambient-${i}`}
                        cx={pos.cx}
                        cy={pos.cy}
                        r="1.5"
                        fill="currentColor"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            y: [0, -10, 0]
                        }}
                        transition={{
                            duration: 4,
                            delay: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
