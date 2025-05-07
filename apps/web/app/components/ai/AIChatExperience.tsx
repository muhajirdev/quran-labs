"use client"

import * as React from "react"
import {
  SendIcon,
  MenuIcon,
  XIcon,
  CompassIcon,
  BookOpenIcon,
  DatabaseIcon
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { HomeCommandDialog } from "~/components/command/HomeCommandDialog"
import { useLocation } from "react-router"
import { ChatMessage } from "./ChatMessage"
import { createChatCompletion } from "~/lib/openrouter"
import { GeometricDecoration } from "~/components/ui/geometric-background"
import { Logo } from "~/components/ui/logo"
import {
  getOrCreateThread,
  updateThread,
  setCurrentThread,
  INITIAL_MESSAGES,
  type Message as ThreadMessage
} from "~/lib/thread-manager"
import { cn } from "~/lib/utils"
import { DiscoverSidebar } from "./DiscoverSidebar"
import { MainContentDiscover } from "./MainContentDiscover"
import { getRegionCodeFromCountry } from "~/constants/regions"
import { useAgent } from 'agents/react'

interface AIChatExperienceProps {
  countryCode?: string;
}

export function AIChatExperience({ countryCode }: AIChatExperienceProps) {
  const agent = useAgent({
    agent: "dialogue-agent",
  });


  // State
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [discoverSheetOpen, setDiscoverSheetOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ThreadMessage[]>([...INITIAL_MESSAGES]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatActive, setChatActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Set default content based on country code
  // This selects the appropriate content file (id.json for Indonesia, en.json for others)
  const [contentRegion, setContentRegion] = useState<string>(getRegionCodeFromCountry(countryCode));

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Initialize from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlQuery = urlParams.get('q');
    const threadParam = urlParams.get('thread');

    if (threadParam) {
      // Load existing thread
      const thread = getOrCreateThread(threadParam);
      setThreadId(thread.id);
      setMessages(thread.messages);
      setChatActive(true);
    } else if (urlQuery) {
      // Handle query parameter
      setQuery(urlQuery);
      setChatActive(true);
      handleQuerySubmission(urlQuery);
      setQuery("");
    }
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom only when chat is active and there are messages to scroll to
  useEffect(() => {
    // Only scroll if chat is active and there are messages beyond the initial system messages
    if (chatActive && messages.length > 2) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatActive]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const trimmedQuery = query.trim();

      // Activate chat
      if (!chatActive) {
        setChatActive(true);
      }

      // Clear input immediately
      setQuery("");

      // Process the query
      handleQuerySubmission(trimmedQuery);
    }
  };

  // Process the query and get AI response
  const handleQuerySubmission = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    // Create user message
    const userMessage: ThreadMessage = {
      role: "user",
      content: queryText
    };

    // Get or create thread
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const newThread = getOrCreateThread(null);
      currentThreadId = newThread.id;
      setThreadId(newThread.id);
    }

    // Update messages and set loading state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Add placeholder for loading state
      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      // Save to thread storage
      updateThread(currentThreadId, updatedMessages);

      // Get AI response
      const response = await createChatCompletion({
        messages: updatedMessages,
        temperature: 0.7,
        max_tokens: 500
      });

      // Get response message
      const assistantMessage = response.choices[0].message;

      // Update messages with response
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save updated thread
      updateThread(currentThreadId, finalMessages);
      setCurrentThread(currentThreadId);

      // Update URL without causing reload
      const url = new URL(window.location.href);
      url.searchParams.set('thread', currentThreadId);
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Create error message
      const errorMessage: ThreadMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      };

      // Update messages with error
      const messagesWithError = [...updatedMessages, errorMessage];
      setMessages(messagesWithError);

      // Save thread with error
      updateThread(currentThreadId, messagesWithError);
      setCurrentThread(currentThreadId);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Use the same handler as the discover sheet for consistency
    handleDiscoverSuggestion(suggestion);
  };

  // Create new chat
  const handleNewChat = () => {
    // Create new thread
    const newThread = getOrCreateThread(null);

    // Update state
    setThreadId(newThread.id);
    setMessages(newThread.messages);
    setChatActive(true);
    setQuery("");

    // Update URL without causing reload
    const url = new URL(window.location.href);
    url.searchParams.set('thread', newThread.id);
    url.searchParams.delete('q');
    window.history.replaceState({}, '', url.toString());
  };

  // Handle suggestion from DiscoverSheet
  const handleDiscoverSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setDiscoverSheetOpen(false);

    // If chat is not active, focus the input
    if (!chatActive) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
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

            {/* Thread ID - Hidden on very small screens */}
            {threadId && (
              <div className="hidden sm:flex items-center">
                <span className="text-xs text-white/40 ml-2">•</span>
                <span className="text-xs text-white/40 ml-2 truncate max-w-[80px] md:max-w-none">
                  Thread {threadId.split('-')[0]}
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
      <main className={`flex-1 flex flex-col ${!chatActive || messages.length <= 2 ? "justify-center" : "justify-start pt-8 sm:pt-10"
        } overflow-hidden pt-12 pb-20 sm:pb-24`}>
        {/* Logo and title - Only visible when chat is not active - Mobile friendly */}
        <div className={`flex flex-col items-center transition-all duration-500 ease-in-out px-3 sm:px-6 ${chatActive && messages.length > 2 ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 mb-10 sm:mb-16"
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
        <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-3 sm:px-6 relative ${chatActive && messages.length > 2 ? "opacity-100 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" : "opacity-0 max-h-0"
          }`}>
          {/* Subtle scroll indicator */}
          {messages.length > 4 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 flex justify-center items-center pointer-events-none opacity-30 animate-bounce">
              <div className="w-1 h-3 bg-white/20 rounded-full"></div>
            </div>
          )}

          <div className="space-y-8 py-6">
            {messages.slice(2).map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLoading={isLoading && index === messages.length - 3}
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about the Quran..."
                  className="border-0 bg-transparent text-white py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:ring-offset-0 placeholder:text-white/30 transition-all duration-300 focus:placeholder:text-white/50"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className={`h-6 w-6 rounded-full transition-all duration-300 ${!query.trim() || isLoading ? 'bg-white/5 text-white/20' : 'bg-accent/10 hover:bg-accent/20 hover:scale-110 text-accent'}`}
                    disabled={!query.trim() || isLoading}
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
