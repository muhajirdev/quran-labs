import * as React from "react";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/ui/logo";
import { Button } from "~/components/ui/button";
import { SparklesIcon, SettingsIcon } from "lucide-react";
import { SuggestionCard } from "./SuggestionCard";
import { getAgentById } from "~/agents/agent-registry";

interface InitialStateViewProps {
  chatActive: boolean;
  selectedAgentId: string;
  handleSelectAgent: (agentId: string) => void;
  setAgentMarketplaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuggestionClick: (suggestion: string) => void;
}

export const InitialStateView: React.FC<InitialStateViewProps> = ({
  chatActive,
  selectedAgentId,
  handleSelectAgent,
  setAgentMarketplaceOpen,
  onSuggestionClick,
}) => {
  // Get the current agent and its suggestions
  const currentAgent = getAgentById(selectedAgentId);
  const suggestions = currentAgent?.suggestions || [];

  return (
    <div
      className={cn(
        `flex flex-col items-center transition-all duration-500 ease-in-out px-4 sm:px-6 ${
          chatActive
            ? "opacity-0 max-h-0 overflow-hidden"
            : "opacity-100 mb-12 sm:mb-16"
        }`
      )}
    >
      {/* Enhanced logo with sophisticated animations */}
      <div className="mb-8 sm:mb-12 relative">
        {/* Primary glow - larger and more sophisticated */}
        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full transform scale-125 opacity-50 animate-[pulse_4s_ease-in-out_infinite]"></div>

        {/* Secondary glow - offset animation for depth */}
        <div className="absolute inset-0 bg-accent/15 blur-2xl rounded-full transform scale-150 opacity-30 animate-[pulse_6s_ease-in-out_infinite_1.5s]"></div>

        {/* Tertiary subtle ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 blur-xl rounded-full transform scale-110 opacity-40 animate-[pulse_8s_ease-in-out_infinite]"></div>

        {/* Main logo container with enhanced hover effect */}
        <div className="relative p-5 sm:p-6 rounded-full hover:scale-105 transition-all duration-500 overflow-hidden group cursor-pointer">
          {/* Logo */}
          <div className="h-20 w-20 sm:h-24 sm:w-24 relative z-10">
            <Logo
              size="lg"
              className="w-full h-full group-hover:brightness-110 transition-all duration-500"
            />
          </div>

          {/* Hover ring effect */}
          <div className="absolute inset-0 border border-accent/20 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
        </div>
      </div>

      {/* Brand title with enhanced styling */}
      <div className="relative mb-8 sm:mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white relative z-10 group cursor-default">
          <span className="group-hover:tracking-wider transition-all duration-500">
            SuperQuran
          </span>
        </h1>
        {/* Enhanced title decoration */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-10 opacity-40 hover:opacity-60 transition-opacity duration-500"
          style={{
            backgroundImage: `url(/images/title-decoration.svg)`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>

      {/* Current Agent Info with enhanced presentation */}
      {currentAgent && (
        <div className="text-center mb-10 sm:mb-12 max-w-2xl">
          <div className="relative group">
            <p className="text-white/70 text-base sm:text-lg text-center leading-relaxed px-6 group-hover:text-white/80 transition-colors duration-300">
              {currentAgent.description}
            </p>
            {/* Subtle underline decoration */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
      )}

      {/* Chat Suggestions Section with enhanced layout */}
      {suggestions.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mb-12">
          {/* Section header with enhanced styling */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center group">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] group-hover:border-accent/20 transition-all duration-300">
                <SparklesIcon className="h-4 w-4 text-accent group-hover:scale-110 transition-transform duration-300" />
                <h2 className="text-white/90 text-lg font-medium group-hover:text-white transition-colors duration-300">
                  Coba tanya ini deh...
                </h2>
              </div>
            </div>
          </div>

          {/* Suggestions grid with enhanced spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                onClick={onSuggestionClick}
                className="animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: "500ms",
                  animationFillMode: "both",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Secondary Actions with enhanced styling */}
      <div className="flex flex-col items-center gap-6 relative">
        {/* Decorative line above actions */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <Button
          variant="outline"
          size="sm"
          className="text-white/60 hover:text-white border-white/[0.08] hover:border-accent/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 group relative overflow-hidden"
          onClick={() => setAgentMarketplaceOpen(true)}
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
            style={{
              backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
              backgroundSize: "150%",
              backgroundPosition: "center",
            }}
          />
          <SettingsIcon className="mr-2 h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Ganti Agent</span>
        </Button>

        <p className="text-white/40 text-xs text-center max-w-xs leading-relaxed">
          Lebih banyak agent akan segera hadir
        </p>
      </div>
    </div>
  );
};
