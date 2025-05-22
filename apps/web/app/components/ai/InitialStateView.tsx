import * as React from "react";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/ui/logo";
import { Button } from "~/components/ui/button";
import { SparklesIcon, ArrowRightIcon } from "lucide-react";
import { AgentCard } from "./AgentCard";
import { AGENT_REGISTRY, getAgentById } from "~/agents/agent-registry";
import type { AgentDefinition } from "~/agents/agent-types";

interface InitialStateViewProps {
  chatActive: boolean;
  selectedAgentId: string;
  handleSelectAgent: (agentId: string) => void;
  setAgentMarketplaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const InitialStateView: React.FC<InitialStateViewProps> = ({
  chatActive,
  selectedAgentId,
  handleSelectAgent,
  setAgentMarketplaceOpen,
}) => {
  return (
    <div
      className={cn(
        `flex flex-col items-center transition-all duration-500 ease-in-out px-3 sm:px-6 ${
          chatActive
            ? "opacity-0 max-h-0 overflow-hidden"
            : "opacity-100 mb-10 sm:mb-16"
        }`
      )}
    >
      {/* Enhanced logo with detailed geometric pattern and animations */}
      <div className="mb-10 relative">
        {/* Outer glow effect with enhanced animation */}
        <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full transform scale-110 opacity-40 animate-[pulse_4s_ease-in-out_infinite]"></div>

        {/* Secondary glow with offset animation */}
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full transform scale-125 opacity-30 animate-[pulse_6s_ease-in-out_infinite_1s]"></div>

        {/* Main logo container with hover effect - Mobile friendly */}
        <div className="relative p-4 sm:p-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden group">
          {/* Crescent logo */}
          <div className="h-16 w-16 sm:h-20 sm:w-20">
            <Logo size="lg" className="w-full h-full" />
          </div>
        </div>
      </div>

      <div className="relative mb-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white relative z-10">
          SuperQuran
        </h1>
        {/* Title decoration */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 opacity-60"
          style={{
            backgroundImage: `url(/images/title-decoration.svg)`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>

      <p className="text-white/70 text-sm sm:text-base max-w-lg text-center mb-8 sm:mb-12 leading-relaxed relative">
        <span className="relative inline-block">
          Explore the Quran through specialized AI agents.
          <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></span>
        </span>
        <span className="block mt-1">
          Choose an agent to begin your journey.
        </span>
      </p>

      {/* Featured Agents Section */}
      <div className="w-full max-w-2xl mx-auto mb-10">
        <h2 className="text-white/90 text-lg font-medium mb-4 flex items-center">
          <SparklesIcon className="h-4 w-4 mr-2 text-accent" />
          Featured Agents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AGENT_REGISTRY.filter(
            (agent: AgentDefinition) => agent.isPopular || agent.isNew
          )
            .slice(0, 4)
            .map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isSelected={agent.id === selectedAgentId}
                onClick={() => {
                  handleSelectAgent(agent.id);
                }}
              />
            ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="text-white/70 hover:text-white border-white/10 hover:border-white/20 bg-white/5"
            onClick={() => setAgentMarketplaceOpen(true)}
          >
            View All Agents
            <ArrowRightIcon className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
