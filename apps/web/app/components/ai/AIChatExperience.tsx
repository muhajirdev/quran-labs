"use client"

import * as React from "react"
import {
  SendIcon,
  MenuIcon,
  XIcon,
  CompassIcon,
  BookOpenIcon,
  DatabaseIcon,
  MapIcon
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
import { MainContentDiscover } from "./MainContentDiscover"
import { getRegionCodeFromCountry } from "~/constants/regions"
import { useAgent } from 'agents/react'
import { useAgentChat } from "agents/ai-react"



interface AIChatExperienceProps {
  countryCode?: string;
}

export default function AIChatExperience({ countryCode }: AIChatExperienceProps) {
  const location = useLocation();

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

  // Connect to the ChatAgent using the useAgent hook with a unique name
  const agentConnection = useAgent({
    agent: "ChatAgent",
    name: sessionId // Use the unique session ID as the agent name
  });

  // Use the useAgentChat hook with the agent connection
  const {
    messages: agentMessages,
    input: agentInput,
    append,
    handleInputChange: agentHandleInputChange,
    handleSubmit: agentHandleSubmit,
    isLoading: agentIsLoading,
    clearHistory: agentClearHistory
  } = useAgentChat({
    agent: agentConnection
  });


  // State
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [discoverSheetOpen, setDiscoverSheetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Set default content based on country code
  // This selects the appropriate content file (id.json for Indonesia, en.json for others)
  const [contentRegion, setContentRegion] = useState<string>(getRegionCodeFromCountry(countryCode));

  // Determine if chat is active based on agent messages
  const chatActive = agentMessages.length > 0;

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize from URL parameters and update URL with session ID
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const urlQuery = urlParams.get('q');
    const urlSession = urlParams.get('session');

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

    // Update URL with session ID if not already present
    if (!urlSession && sessionId && sessionId !== 'server-session') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('session', sessionId);
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
  }, [sessionId]);

  // Measure component mount time
  useEffect(() => {
    console.log("AIChatExperience component mounted at:", performance.now());

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

    // Use the agent's submit handler
    agentHandleSubmit(e);
  };

  // Handle suggestion click - immediately send the message without showing in input
  const handleSuggestionClick = (suggestion: string) => {
    append({
      role: "user",
      content: suggestion
    })


    // // Store the current input value
    // const currentInput = agentInput;

    // // Set the suggestion as input
    // agentHandleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);

    // // Use requestAnimationFrame to ensure the input value is set before submitting
    // requestAnimationFrame(() => {
    //   // Create a simple form event
    //   const event = {
    //     preventDefault: () => { }
    //   } as React.FormEvent<HTMLFormElement>;

    //   // Submit the form

    //   // Restore the previous input value or clear it
    //   requestAnimationFrame(() => {
    //     agentHandleInputChange({ target: { value: currentInput } } as React.ChangeEvent<HTMLInputElement>);
    //   });
    // });

    // // Close the discover sheet if it's open
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

  // Handle suggestion from DiscoverSheet - immediately send the message without showing in input
  const handleDiscoverSuggestion = (suggestion: string) => {
    console.log("Discover suggestion selected:", suggestion);

    // Store the current input value
    const currentInput = agentInput;

    // Set the suggestion as input
    agentHandleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);

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

            {/* Session ID indicator - Hidden on very small screens */}
            {agentConnection && sessionId && (
              <div className="hidden sm:flex items-center">
                <span className="text-xs text-white/40 ml-2">•</span>
                <span className="text-xs text-white/40 ml-2 truncate max-w-[80px] md:max-w-none">
                  Session {sessionId.split('-')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Discover button - only visible if chat is active */}
            {chatActive && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white text-xs h-7 px-3 relative overflow-hidden group border-0 hover:bg-white/5"
                onClick={() => setDiscoverSheetOpen(true)}
              >
                <CompassIcon className="h-3 w-3 mr-1.5 text-accent/80" />
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Discover</span>
              </Button>
            )}

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
            {/* Discover button - only visible if chat is active */}
            {chatActive && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white/50 hover:text-white text-xs h-8 px-3 justify-start relative overflow-hidden group border-0 hover:bg-white/5 w-full"
                onClick={() => {
                  setDiscoverSheetOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <CompassIcon className="h-3 w-3 mr-1.5 text-accent/80" />
                <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">Discover</span>
              </Button>
            )}

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
              Explore the Quran through an interactive AI assistant.
              <span className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></span>
            </span>
            <span className="block mt-1">Ask questions, discover connections, and gain deeper insights.</span>
          </p>

          {/* Discover Content in Main Area */}
          <div className="mb-10 sm:mb-14 w-full">
            <MainContentDiscover
              onSelectSuggestion={handleSuggestionClick}
              currentLanguage={contentRegion}
              setCurrentLanguage={setContentRegion}
            />
          </div>
        </div>

        {/* Chat Messages - Centered container with scroll indicator - Mobile friendly */}
        <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-3 sm:px-6 relative ${chatActive ? "opacity-100 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" : "opacity-0 max-h-0"
          }`}>
          {/* Subtle scroll indicator */}
          {agentMessages.length > 4 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 flex justify-center items-center pointer-events-none opacity-30 animate-bounce">
              <div className="w-1 h-3 bg-white/20 rounded-full"></div>
            </div>
          )}

          <div className="space-y-8 py-6">
            {agentMessages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLoading={agentIsLoading && index === agentMessages.length - 1 && agentMessages[index].content.length === 0}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - Fixed at bottom with consistent blur and transition */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-10 w-full px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300",
          discoverSheetOpen && "md:left-[350px] md:w-[calc(100%-350px)]" // Shift input area and adjust width when sidebar is open
        )}>
          <div className="absolute inset-0 blur-layer"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

          <div className="max-w-xl mx-auto relative z-10">
            {/* Enhanced input form with animations and improved hover effects */}
            <div className="relative rounded-lg overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.06] focus-within:border-accent/20 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 group">


              <form onSubmit={handleSubmit} className="w-full relative z-10">
                <Input
                  ref={inputRef}
                  value={agentInput}
                  onChange={agentHandleInputChange}
                  placeholder="Ask about the Quran..."
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
    </div>
  );
}
