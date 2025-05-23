import { SendIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { AgentDefinition } from "~/agents/agent-types";
import type { RefObject } from "react";
import React from "react";

interface ChatInputAreaProps {
  discoverSheetOpen?: boolean;
  selectedAgent: AgentDefinition | undefined;
  chatActive: boolean;
  setAgentMarketplaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (e: React.FormEvent) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  agentInput: string;
  agentHandleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  agentIsLoading: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  discoverSheetOpen,
  selectedAgent,
  chatActive,
  setAgentMarketplaceOpen,
  handleSubmit,
  inputRef,
  agentInput,
  agentHandleInputChange,
  agentIsLoading,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-10 w-full px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300"
      )}
    >
      <div className="absolute inset-0 blur-layer"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* Agent indicator above input */}
        {selectedAgent && chatActive && (
          <div className="flex items-center mb-2 px-1">
            <div
              className="w-2 h-2 rounded-full mr-1.5"
              style={{
                backgroundColor: selectedAgent.iconColor || "#FFFFFF",
              }}
            ></div>
            <span className="text-xs text-white/50">Chatting with </span>
            <span
              className="text-xs font-medium ml-1"
              style={{ color: selectedAgent.iconColor || "#FFFFFF" }}
            >
              {selectedAgent.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white/60 ml-auto h-6 px-2 py-0"
              onClick={() => setAgentMarketplaceOpen(true)}
            >
              <span className="text-xs">Change</span>
            </Button>
          </div>
        )}

        {/* Enhanced input form with animations and improved hover effects */}
        <div className="relative rounded-lg overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.06] focus-within:border-accent/20 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <form onSubmit={handleSubmit} className="w-full relative z-10">
            <Input
              ref={inputRef}
              value={agentInput}
              onChange={agentHandleInputChange}
              placeholder={
                selectedAgent
                  ? `Ask ${selectedAgent.name.toLowerCase()}...`
                  : "Ask about the Quran..."
              }
              className="border-0 bg-transparent text-white py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:ring-offset-0 placeholder:text-white/30 transition-all duration-300 focus:placeholder:text-white/50"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={`h-6 w-6 rounded-full transition-all duration-300 ${
                  !agentInput.trim() || agentIsLoading
                    ? "bg-white/5 text-white/20"
                    : "bg-accent/10 hover:bg-accent/20 hover:scale-110 text-accent"
                }`}
                disabled={!agentInput.trim() || agentIsLoading}
              >
                <SendIcon className="h-3 w-3 transition-colors" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Enhanced experimental warning message with elegant styling - Mobile friendly */}
        <div className="flex items-center justify-center mt-3 sm:mt-4 relative">
          {/* Subtle decorative elements */}
          <div className="absolute left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          <div className="px-2 sm:px-4 py-1 sm:py-2 relative">
            <p className="text-[9px] sm:text-[10px] text-white/30 text-center flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 group">
              <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
              <span className="group-hover:text-white/40 transition-colors duration-300 text-center">
                Experimental research preview - Please verify information for
                accuracy
              </span>
              <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
