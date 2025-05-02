import React from "react";
import { cn } from "~/lib/utils";

interface GeometricBackgroundProps {
  className?: string;
  variant?: "default" | "subtle" | "elegant" | "animated";
  children?: React.ReactNode;
}

export function GeometricBackground({
  className,
  variant = "subtle",
  children,
}: GeometricBackgroundProps) {
  const patternUrl = getPatternUrl(variant);

  return (
    <div
      className={cn(
        "relative w-full h-full",
        className
      )}
      style={{
        backgroundImage: `url(${patternUrl})`,
        backgroundRepeat: "repeat",
        backgroundSize: "600px 600px",
      }}
    >
      {children}
    </div>
  );
}

export function GeometricDecoration({
  className,
  variant = "default",
}: Omit<GeometricBackgroundProps, "children">) {
  const patternUrl = getPatternUrl(variant);

  // Determine opacity based on variant
  const opacityValue = variant === "default"
    ? 0.15
    : variant === "elegant"
      ? 0.2
      : variant === "animated"
        ? 0.15
        : 0.08;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-0",
        className
      )}
      style={{
        backgroundImage: `url(${patternUrl})`,
        backgroundRepeat: "repeat",
        backgroundSize: "600px 600px",
        opacity: opacityValue,
      }}
      aria-hidden="true"
    />
  );
}

// Helper function to get the pattern URL based on variant
function getPatternUrl(variant: "default" | "subtle" | "elegant" | "animated") {
  switch (variant) {
    case "default":
      return "/images/geometric-pattern.svg";
    case "elegant":
      return "/images/geometric-pattern-elegant.svg";
    case "animated":
      return "/images/geometric-pattern-animated.svg";
    case "subtle":
    default:
      return "/images/geometric-pattern-subtle.svg";
  }
}
