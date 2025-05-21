"use client"

import * as React from "react"
import {
  SendIcon,
  MenuIcon,
  XIcon,
  CompassIcon,
  BookOpenIcon,
  DatabaseIcon,
  MapIcon,
  SparklesIcon,
  BotIcon,
  ArrowRightIcon
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { HomeCommandDialog } from "~/components/command/HomeCommandDialog"
import { useLocation } from "react-router"
import { ChatMessage } from "./ChatMessage"
import { GeometricDecoration } from "~/components/ui/geometric-background"
import { Logo } from "~/components/ui/logo"
import { cn } from "~/lib/utils"
import { DiscoverSidebar } from "./DiscoverSidebar"
import { getRegionCodeFromCountry } from "~/constants/regions"
import { useAgent } from 'agents/react'
import { useAgentChat } from "agents/ai-react"
import { AgentMarketplace } from "./AgentMarketplace"
import { AgentCard } from "./AgentCard"
import { AGENT_REGISTRY, getAgentById } from "~/agents/agent-registry"
import type { AgentDefinition } from "~/agents/agent-types"

interface AIChatExperienceProps {
  countryCode?: string;
}

export default function AIChatExperience({ countryCode }: AIChatExperienceProps) {
  const location = useLocation();

  // State
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [discoverSheetOpen, setDiscoverSheetOpen] = useState(false);
  const [agentMarketplaceOpen, setAgentMarketplaceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Set default content based on country code
  // This selects the appropriate content file (id.json for Indonesia, en.json for others)
  const [contentRegion, setContentRegion] = useState<string>(getRegionCodeFromCountry(countryCode));
  // Selected agent ID
  const [selectedAgentId, setSelectedAgentId] = useState<string>("general");

  // Generate or retrieve a unique session ID from URL or localStorage
  const [sessionId, setSessionId] = useState<string>(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Return a placeholder during server-side rendering
      return 'server-session';
    }

    // Check URL for session parameter
    const urlParams = new URLSearchParams(location.search);
    const urlSession = urlParams.get('session');

    if (urlSession) {
      return urlSession;
    }

    // Check localStorage for existing session
    try {
      const storedSession = localStorage.getItem('quran-ai-session-id');

      if (storedSession) {
        return storedSession;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // Generate a new session ID if none exists
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    try {
      localStorage.setItem('quran-ai-session-id', newSessionId);
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
    return newSessionId;
  });

  // Get the agent class based on the selected agent ID
  const selectedAgent = getAgentById(selectedAgentId);

  // Connect to the MetaAgent using the useAgent hook with a unique name that includes the agent type
  const connectionKey = `${sessionId}-${selectedAgentId}`;

  // Log the connection details for debugging
  console.log(`Creating agent connection with key: ${connectionKey}`);
  console.log(`Selected agent: ${selectedAgentId}`);

  // Create the agent connection
  const agentConnection = useAgent({
    agent: "MetaAgent",
    name: connectionKey, // Use the unique session ID and agent ID
  });

  // Use the useAgentChat hook with the agent connection
  const {
    messages: agentMessages,
    input: agentInput,
    // Removed unused 'append' to fix TypeScript warning
    handleInputChange: agentHandleInputChange,
    handleSubmit: agentHandleSubmit,
    isLoading: agentIsLoading,
    clearHistory: agentClearHistory
  } = useAgentChat({
    agent: agentConnection
  });

  // Determine if chat is active based on agent messages
  const chatActive = agentMessages.length > 0;

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize from URL parameters and update URL with session ID and agent ID
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const urlQuery = urlParams.get('q');
    const urlSession = urlParams.get('session');
    const urlAgent = urlParams.get('agent');

    // If there's an agent parameter, set the selected agent
    if (urlAgent && getAgentById(urlAgent)) {
      setSelectedAgentId(urlAgent);
    }

    // If there's a query parameter, submit it to the agent immediately without showing in input
    if (urlQuery) {
      console.log("URL query parameter found:", urlQuery);

      // Set the suggestion as input
      agentHandleInputChange({ target: { value: urlQuery } } as React.ChangeEvent<HTMLInputElement>);

      // Use requestAnimationFrame to ensure the input value is set before submitting
      requestAnimationFrame(() => {
        // Create a simple form event
        const event = {
          preventDefault: () => { }
        } as React.FormEvent<HTMLFormElement>;

        // Submit the form
        agentHandleSubmit(event);

        // Clear the input field after submission
        requestAnimationFrame(() => {
          agentHandleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
        });
      });
    }

    // Update URL with session ID and agent ID if not already present
    if ((!urlSession && sessionId && sessionId !== 'server-session') ||
      (!urlAgent && selectedAgentId)) {
      try {
        const url = new URL(window.location.href);
        if (!urlSession && sessionId && sessionId !== 'server-session') {
          url.searchParams.set('session', sessionId);
        }
        if (!urlAgent && selectedAgentId) {
          url.searchParams.set('agent', selectedAgentId);
        }
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
  }, [sessionId, selectedAgentId, agentHandleInputChange, agentHandleSubmit]);

  // Measure component mount time
  useEffect(() => {
    console.log("AIChatExperience component mounted at:", performance.now());

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle agent changes - force a new connection and clear history
  useEffect(() => {
    console.log(`Agent changed to: ${selectedAgentId}`);

    // Clear chat history when agent changes
    if (agentClearHistory) {
      agentClearHistory();
    }

    // The connection will be recreated automatically because we're using the agent ID in the connection name
  }, [selectedAgentId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if chat is active and there are messages beyond the initial system messages
    if (chatActive) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentMessages, chatActive]);

  // Handle form submission - delegate to agent
  const handleSubmit = (e: React.FormEvent) => {
    // Prevent default form submission
    e.preventDefault();

    // Add a special prefix to the message to indicate the agent type
    if (agentInput.trim()) {
      // Store the original input
      const originalInput = agentInput;

      // Modify the input to include the agent type as a special command
      const modifiedInput = `[AGENT:${selectedAgentId}] ${originalInput}`;

      // Set the modified input
      agentHandleInputChange({ target: { value: modifiedInput } } as React.ChangeEvent<HTMLInputElement>);

      // Use requestAnimationFrame to ensure the input value is set before submitting
      requestAnimationFrame(() => {
        // Submit the form with the modified input
        agentHandleSubmit(e);

        // Restore the original input for display purposes
        requestAnimationFrame(() => {
          agentHandleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
        });
      });
    } else {
      // If the input is empty, just submit as is
      agentHandleSubmit(e);
    }
  };

  // Handle suggestion from DiscoverSheet - immediately send the message without showing in input
  const handleDiscoverSuggestion = (suggestion: string) => {
    console.log("Discover suggestion selected:", suggestion);

    // Store the current input value
    const currentInput = agentInput;

    // Modify the suggestion to include the agent type as a special command
    const modifiedSuggestion = `[AGENT:${selectedAgentId}] ${suggestion}`;

    // Set the modified suggestion as input
    agentHandleInputChange({ target: { value: modifiedSuggestion } } as React.ChangeEvent<HTMLInputElement>);

    // Use requestAnimationFrame to ensure the input value is set before submitting
    requestAnimationFrame(() => {
      // Create a simple form event
      const event = {
        preventDefault: () => { }
      } as React.FormEvent<HTMLFormElement>;

      // Submit the form
      agentHandleSubmit(event);

      // Restore the previous input value or clear it
      requestAnimationFrame(() => {
        agentHandleInputChange({ target: { value: currentInput } } as React.ChangeEvent<HTMLInputElement>);
      });
    });

    // Close the discover sheet
    setDiscoverSheetOpen(false);
  };

  // Create new chat
  const handleNewChat = () => {
    // Generate a new session ID
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Update localStorage and state
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quran-ai-session-id', newSessionId);
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }

    setSessionId(newSessionId);

    // Clear the agent's chat history
    agentClearHistory();

    // Update URL without causing reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('thread');
      url.searchParams.delete('q');
      url.searchParams.set('session', newSessionId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Handle agent selection from marketplace
  const handleSelectAgent = (agentId: string) => {
    console.log("Agent selected:", agentId);

    // Create a new session for this agent
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Update localStorage and state
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('quran-ai-session-id', newSessionId);
      }
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }

    // First update the session ID
    setSessionId(newSessionId);

    // Log the agent selection
    console.log(`Selecting agent: ${agentId}`);

    // Then update the selected agent ID
    // This order is important to ensure the connection is properly recreated
    setSelectedAgentId(agentId);

    // Clear the agent's chat history - this is also handled in the useEffect
    if (agentClearHistory) {
      agentClearHistory();
    }

    // Update URL without causing reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('thread');
      url.searchParams.delete('q');
      url.searchParams.set('session', newSessionId);
      url.searchParams.set('agent', agentId);
      window.history.replaceState({}, '', url.toString());
    }

    // Close the marketplace
    setAgentMarketplaceOpen(false);

    console.log(`Agent selection complete: ${agentId} with session ${newSessionId}`);
  };

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-[#0A0A0A] relative transition-all duration-300",
      discoverSheetOpen && "md:pl-[350px]" // Add padding when sidebar is open on desktop
    )}>
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Header - Fixed position with consistent blur and transition */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-10 transition-all duration-300",
        mobileMenuOpen && "backdrop-blur-md",
        discoverSheetOpen && "md:left-[350px]" // Shift header when sidebar is open on desktop
      )}>
        {/* Desktop and Mobile Header Layout */}
        <div className="flex items-center justify-between py-3 px-3 sm:px-6 relative z-10">
          {/* Logo and Thread ID */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="font-medium text-sm tracking-wide text-white hover:text-accent transition-all duration-300 flex items-center group"
            >
              <span className="relative mr-1.5">
                <Logo size="sm" className="group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
              </span>
              <span className="group-hover:tracking-wider transition-all duration-300">Quran AI</span>
            </button>

            {/* Agent and Session ID indicator - Hidden on very small screens */}
            {agentConnection && sessionId && (
              <div className="hidden sm:flex items-center">
                {selectedAgent && (
                  <>
                    <span className="text-xs text-white/40 ml-2">•</span>
                    <span
                      className="text-xs text-white/60 ml-2 flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-full"
                      style={{ color: selectedAgent.iconColor || "#FFFFFF" }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedAgent.iconColor || "#FFFFFF" }}></span>
                      {selectedAgent.name}
                    </span>
                  </>
                )}
                <span className="text-xs text-white/40 ml-2">•</span>
                <span className="text-xs text-white/40 ml-2 truncate max-w-[80px] md:max-w-none">
                  Session {sessionId.split('-')[0]}
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
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300 font-medium">Agents</span>
            </Button>

            {/* Current Agent indicator - only visible if an agent is selected */}
            {selectedAgent && chatActive && (
              <div className="flex items-center px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: selectedAgent.iconColor || "#FFFFFF" }}
                ></div>
                <span className="text-xs text-white/70">{selectedAgent.name}</span>
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
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Discover</span>
            </Button>

            {/* Read button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
              onClick={() => window.location.href = '/read'}
            >
              <BookOpenIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Read</span>
            </Button>

            {/* Journey button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
              onClick={() => window.location.href = '/journey'}
            >
              <MapIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">The Journey</span>
            </Button>

            {/* Explore Data button - only visible if chat is NOT active */}
            {!chatActive && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
                onClick={() => window.location.href = '/data-explorer'}
              >
                <DatabaseIcon className="h-3 w-3 mr-1.5 text-accent/80" />
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Explore Data</span>
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
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">New Chat</span>
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
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-64 opacity-100 border-b border-white/5' : 'max-h-0 opacity-0'}`}>
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
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Agents</span>
            </Button>

            {/* Current Agent indicator - only visible if an agent is selected */}
            {selectedAgent && chatActive && (
              <div className="flex items-center px-3 py-1.5 rounded-md bg-white/5 border border-white/10 mx-1 mb-1">
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: selectedAgent.iconColor || "#FFFFFF" }}
                ></div>
                <span className="text-xs text-white/70">{selectedAgent.name}</span>
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
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Discover</span>
            </Button>

            {/* Read button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
              onClick={() => {
                window.location.href = '/read';
                setMobileMenuOpen(false);
              }}
            >
              <BookOpenIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Read</span>
            </Button>

            {/* Journey button - always visible */}
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
              onClick={() => {
                window.location.href = '/journey';
                setMobileMenuOpen(false);
              }}
            >
              <MapIcon className="h-3 w-3 mr-1.5 text-accent/80" />
              <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">The Journey</span>
            </Button>

            {/* Explore Data button - only visible if chat is NOT active */}
            {!chatActive && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
                onClick={() => {
                  window.location.href = '/data-explorer';
                  setMobileMenuOpen(false);
                }}
              >
                <DatabaseIcon className="h-3 w-3 mr-1.5 text-accent/80" />
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Explore Data</span>
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
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">New Chat</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      {/* Main content - Centered when empty with padding for fixed header - Mobile friendly */}
      <main className={`flex-1 flex flex-col ${!chatActive ? "justify-center" : "justify-start pt-8 sm:pt-10"
        } overflow-hidden pt-12 pb-20 sm:pb-24`}>
        {/* Logo and title - Only visible when chat is not active - Mobile friendly */}
        <div className={`flex flex-col items-center transition-all duration-500 ease-in-out px-3 sm:px-6 ${chatActive ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 mb-10 sm:mb-16"
          }`}>
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
              Quran AI
            </h1>
            {/* Title decoration */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 h-8 opacity-60" style={{
              backgroundImage: `url(/images/title-decoration.svg)`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}></div>
          </div>

          <p className="text-white/70 text-sm sm:text-base max-w-lg text-center mb-8 sm:mb-12 leading-relaxed relative">
            <span className="relative inline-block">
              Explore the Quran through specialized AI agents.
              <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></span>
            </span>
            <span className="block mt-1">Choose an agent to begin your journey.</span>
          </p>

          {/* Featured Agents Section */}
          <div className="w-full max-w-2xl mx-auto mb-10">
            <h2 className="text-white/90 text-lg font-medium mb-4 flex items-center">
              <SparklesIcon className="h-4 w-4 mr-2 text-accent" />
              Featured Agents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AGENT_REGISTRY.filter((agent: AgentDefinition) => agent.isPopular || agent.isNew).slice(0, 4).map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={agent.id === selectedAgentId}
                  onClick={() => {
                    handleSelectAgent(agent.id);
                    // Immediately start a chat with this agent
                    const event = { preventDefault: () => { } } as React.FormEvent<HTMLFormElement>;

                    // Include the agent type in the message
                    const initialMessage = `[AGENT:${agent.id}] Hello, I'd like to use the ${agent.name}.`;

                    agentHandleInputChange({ target: { value: initialMessage } } as React.ChangeEvent<HTMLInputElement>);
                    requestAnimationFrame(() => {
                      agentHandleSubmit(event);
                      requestAnimationFrame(() => {
                        agentHandleInputChange({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                      });
                    });
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

        {/* Chat Messages - Centered container with scroll indicator - Mobile friendly */}
        <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-3 sm:px-6 relative ${chatActive ? "opacity-100 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" : "opacity-0 max-h-0"
          }`}>
          {/* Messages container */}
          <div className="space-y-6 pb-4">
            {agentMessages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLastMessage={index === agentMessages.length - 1}
                isLoading={index === agentMessages.length - 1 && agentIsLoading}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input - Fixed at bottom with backdrop blur - Mobile friendly */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-10 w-full px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300",
          discoverSheetOpen && "md:left-[350px] md:w-[calc(100%-350px)]" // Shift input area and adjust width when sidebar is open
        )}>
          <div className="absolute inset-0 blur-layer"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

          <div className="max-w-xl mx-auto relative z-10">
            {/* Agent indicator above input */}
            {selectedAgent && chatActive && (
              <div className="flex items-center mb-2 px-1">
                <div
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: selectedAgent.iconColor || "#FFFFFF" }}
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
                  placeholder={selectedAgent ? `Ask ${selectedAgent.name.toLowerCase()}...` : "Ask about the Quran..."}
                  className="border-0 bg-transparent text-white py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:ring-offset-0 placeholder:text-white/30 transition-all duration-300 focus:placeholder:text-white/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className={`h-6 w-6 rounded-full transition-all duration-300 ${!agentInput.trim() || agentIsLoading ? 'bg-white/5 text-white/20' : 'bg-accent/10 hover:bg-accent/20 hover:scale-110 text-accent'}`}
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
                    Experimental research preview - Please verify information for accuracy
                  </span>
                  <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Command Dialog */}
      <HomeCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />

      {/* Discover Sidebar */}
      <DiscoverSidebar
        open={discoverSheetOpen}
        onClose={() => setDiscoverSheetOpen(false)}
        onSelectSuggestion={handleDiscoverSuggestion}
        currentLanguage={contentRegion}
        setCurrentLanguage={setContentRegion}
      />

      {/* Agent Marketplace */}
      <AgentMarketplace
        open={agentMarketplaceOpen}
        onClose={() => setAgentMarketplaceOpen(false)}
        onSelectAgent={handleSelectAgent}
        selectedAgentId={selectedAgentId}
      />
    </div>
  );
}
