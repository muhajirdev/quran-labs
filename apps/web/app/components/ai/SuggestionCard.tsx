import * as React from "react";
import { MessageSquareIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface SuggestionCardProps {
  suggestion: string;
  onClick: (suggestion: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onClick,
  className,
  style,
}) => {
  return (
    <button
      className={cn(
        "w-full bg-white/[0.02] hover:bg-white/[0.04] rounded-xl p-4 text-left transition-all duration-300",
        "border border-white/[0.03] hover:border-accent/20",
        "hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] group relative overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
        className
      )}
      style={style}
      onClick={() => onClick(suggestion)}
    >
      {/* Subtle animated pattern on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{
          backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
          backgroundSize: "200%",
          backgroundPosition: "center",
        }}
      />

      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-accent/[0.08] group-hover:bg-accent/[0.15] transition-all duration-300 flex items-center justify-center">
          <MessageSquareIcon className="h-3.5 w-3.5 text-accent/80 group-hover:text-accent transition-colors duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="mt-0.5 text-white/80 group-hover:text-white font-medium text-sm transition-colors duration-300 leading-relaxed tracking-wide">
            {suggestion}
          </p>
        </div>
      </div>

      {/* Subtle bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};
