import {
  SparklesIcon,
  CompassIcon,
  BookOpenIcon,
  MapIcon,
  DatabaseIcon,
  XIcon,
  MenuIcon,
} from "lucide-react";
import type { AgentDefinition } from "~/agents/agent-types";
import { cn } from "~/lib/utils";
import { Logo } from "../ui/logo";
import { Button } from "../ui/button";

interface ChatHeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  discoverSheetOpen: boolean;
  sessionId: string;
  selectedAgent: AgentDefinition | undefined;
  chatActive: boolean;
  setAgentMarketplaceOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDiscoverSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleNewChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  discoverSheetOpen,
  sessionId,
  selectedAgent,
  chatActive,
  setAgentMarketplaceOpen,
  setDiscoverSheetOpen,
  handleNewChat,
}) => {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-10 transition-all duration-300",
        mobileMenuOpen && "backdrop-blur-md",
        discoverSheetOpen && "md:left-[350px]" // Shift header when sidebar is open on desktop
      )}
    >
      {/* Desktop and Mobile Header Layout */}
      <div className="flex items-center justify-between py-3 px-3 sm:px-6 relative z-10">
        {/* Logo and Thread ID */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => (window.location.href = "/")} // TODO: Replace with client-side navigation
            className="font-medium text-sm tracking-wide text-white hover:text-accent transition-all duration-300 flex items-center group"
          >
            <span className="relative mr-1.5">
              <Logo
                size="sm"
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
            </span>
            <span className="group-hover:tracking-wider transition-all duration-300">
              Quran AI
            </span>
          </button>

          {/* Agent and Session ID indicator - Hidden on very small screens */}
          {sessionId && (
            <div className="hidden sm:flex items-center">
              {selectedAgent && (
                <>
                  <span className="text-xs text-white/40 ml-2">•</span>
                  <span
                    className="text-xs text-white/60 ml-2 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-full"
                    style={{ color: selectedAgent.iconColor || "#FFFFFF" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: selectedAgent.iconColor || "#FFFFFF",
                      }}
                    ></span>
                    {selectedAgent.name}
                  </span>
                </>
              )}
              <span className="text-xs text-white/40 ml-2">•</span>
              <span className="text-xs text-white/40 ml-2 truncate max-w-[80px] md:max-w-none">
                Session {sessionId.split("-")[0]}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Agent Marketplace button - always visible with accent styling */}
          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:text-accent/90 text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-accent/5"
            onClick={() => setAgentMarketplaceOpen(true)}
          >
            <SparklesIcon className="h-3 w-3 mr-1.5 text-accent" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300 font-medium">
              Agents
            </span>
          </Button>

          {/* Current Agent indicator - only visible if an agent is selected */}
          {selectedAgent && chatActive && (
            <div className="flex items-center px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <div
                className="w-2 h-2 rounded-full mr-1.5"
                style={{
                  backgroundColor: selectedAgent.iconColor || "#FFFFFF",
                }}
              ></div>
              <span className="text-xs text-white/70">
                {selectedAgent.name}
              </span>
            </div>
          )}

          {/* Discover button - secondary importance */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
            onClick={() => setDiscoverSheetOpen(true)}
          >
            <CompassIcon className="h-3 w-3 mr-1.5 text-white/50" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Discover
            </span>
          </Button>

          {/* Read button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
            onClick={() => (window.location.href = "/read")} // TODO: Replace with client-side navigation
          >
            <BookOpenIcon className="h-3 w-3 mr-1.5 text-accent/80" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Read
            </span>
          </Button>

          {/* Journey button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
            onClick={() => (window.location.href = "/journey")} // TODO: Replace with client-side navigation
          >
            <MapIcon className="h-3 w-3 mr-1.5 text-accent/80" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              The Journey
            </span>
          </Button>

          {/* Explore Data button - only visible if chat is NOT active */}
          {!chatActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
              onClick={() => (window.location.href = "/data-explorer")} // TODO: Replace with client-side navigation
            >
              <DatabaseIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
                Explore Data
              </span>
            </Button>
          )}

          {/* New Chat button - only visible if chat is active */}
          {chatActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
              onClick={handleNewChat}
            >
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
                New Chat
              </span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full relative overflow-hidden border-0 hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XIcon className="h-4 w-4 text-white/70" />
            ) : (
              <MenuIcon className="h-4 w-4 text-white/70" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Collapsible */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "max-h-64 opacity-100 border-b border-white/5"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 py-2 flex flex-col gap-2">
          {/* Agent Marketplace button - always visible with accent styling */}
          <Button
            variant="ghost"
            size="sm"
            className="text-accent hover:text-accent/90 text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-accent/5 w-full font-medium"
            onClick={() => {
              setAgentMarketplaceOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <SparklesIcon className="h-3 w-3 mr-1.5 text-accent" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Agents
            </span>
          </Button>

          {/* Current Agent indicator - only visible if an agent is selected */}
          {selectedAgent && chatActive && (
            <div className="flex items-center px-3 py-1.5 rounded-md bg-white/5 border border-white/10 mx-1 mb-1">
              <div
                className="w-2 h-2 rounded-full mr-1.5"
                style={{
                  backgroundColor: selectedAgent.iconColor || "#FFFFFF",
                }}
              ></div>
              <span className="text-xs text-white/70">
                {selectedAgent.name}
              </span>
            </div>
          )}

          {/* Discover button - secondary importance */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
            onClick={() => {
              setDiscoverSheetOpen(true);
              setMobileMenuOpen(false);
            }}
          >
            <CompassIcon className="h-3 w-3 mr-1.5 text-white/50" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Discover
            </span>
          </Button>

          {/* Read button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
            onClick={() => {
              window.location.href = "/read"; // TODO: Replace with client-side navigation
              setMobileMenuOpen(false);
            }}
          >
            <BookOpenIcon className="h-3 w-3 mr-1.5 text-accent/80" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Read
            </span>
          </Button>

          {/* Journey button - always visible */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
            onClick={() => {
              window.location.href = "/journey"; // TODO: Replace with client-side navigation
              setMobileMenuOpen(false);
            }}
          >
            <MapIcon className="h-3 w-3 mr-1.5 text-accent/80" />
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              The Journey
            </span>
          </Button>

          {/* Explore Data button - only visible if chat is NOT active */}
          {!chatActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
              onClick={() => {
                window.location.href = "/data-explorer"; // TODO: Replace with client-side navigation
                setMobileMenuOpen(false);
              }}
            >
              <DatabaseIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
                Explore Data
              </span>
            </Button>
          )}

          {/* New Chat button - only visible if chat is active */}
          {chatActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
              onClick={() => {
                handleNewChat();
                setMobileMenuOpen(false);
              }}
            >
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
                New Chat
              </span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
