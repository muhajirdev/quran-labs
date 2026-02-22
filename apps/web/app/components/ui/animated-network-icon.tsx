import React from "react";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";

interface AnimatedNetworkIconProps {
    className?: string;
}

export function AnimatedNetworkIcon({ className }: AnimatedNetworkIconProps) {
    // SVG drawing animation variants
    const pathVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 0.5,
            transition: {
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse" as const,
            }
        }
    };

    // Node popping and pulsing
    const nodeVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        },
        pulse: {
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            transition: {
                duration: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
            }
        }
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            {/* Background soft glow */}
            <motion.div
                className="absolute inset-0 bg-current blur-2xl opacity-10 rounded-full"
                animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
            />

            <motion.svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible relative z-10 text-current"
                initial="hidden"
                animate="visible"
            >
                {/* Edges - Outer Pentagon */}
                <motion.path
                    d="M50 15 L85 40 L70 85 L30 85 L15 40 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    variants={pathVariants}
                    custom={0}
                />
                {/* Inner Connections */}
                <motion.path
                    d="M50 15 L50 50 L85 40 M50 50 L70 85 M50 50 L30 85 M50 50 L15 40"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                    variants={pathVariants}
                />

                {/* Nodes */}
                <g fill="currentColor">
                    {[
                        { cx: 50, cy: 15 },
                        { cx: 85, cy: 40 },
                        { cx: 70, cy: 85 },
                        { cx: 30, cy: 85 },
                        { cx: 15, cy: 40 },
                    ].map((pos, i) => (
                        <motion.circle
                            key={`node-${i}`}
                            cx={pos.cx}
                            cy={pos.cy}
                            r="3"
                            variants={nodeVariants}
                            initial="hidden"
                            animate={["visible", "pulse"]}
                            custom={i}
                        />
                    ))}
                    {/* Central Hub Node */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="5" // slightly larger
                        fill="currentColor"
                        variants={nodeVariants}
                        initial="hidden"
                        animate={["visible", "pulse"]}
                        className="drop-shadow-[0_0_8px_currentColor]"
                    />
                </g>
            </motion.svg>
        </div>
    );
}
