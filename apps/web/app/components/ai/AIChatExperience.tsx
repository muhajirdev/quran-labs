"use client"

import * as React from "react"
import {
  SearchIcon,
  SendIcon,
  BrainCircuitIcon,
  BookIcon,
  LayersIcon,
  BookMarkedIcon,
  NetworkIcon,
  SparklesIcon
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { HomeCommandDialog } from "~/components/command/HomeCommandDialog"
import { useLocation } from "react-router"
import { ChatMessage } from "./ChatMessage"
import { createChatCompletion } from "~/lib/openrouter"
import {
  getOrCreateThread,
  updateThread,
  setCurrentThread,
  INITIAL_MESSAGES,
  type Message as ThreadMessage
} from "~/lib/thread-manager"

// Suggestion chips for the homepage
const SUGGESTIONS = [
  { text: "What does the Quran say about patience?", icon: <BookIcon className="h-3 w-3" /> },
  { text: "Find verses about forgiveness", icon: <SearchIcon className="h-3 w-3" /> },
  { text: "Explain the first chapter of the Quran", icon: <BookMarkedIcon className="h-3 w-3" /> },
  { text: "How to deal with anxiety in Islam?", icon: <BrainCircuitIcon className="h-3 w-3" /> },
  { text: "Compare translations of verse 2:255", icon: <LayersIcon className="h-3 w-3" /> },
  { text: "Show me connections between mercy and forgiveness", icon: <NetworkIcon className="h-3 w-3" /> },
];

export function AIChatExperience() {
  // State
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ThreadMessage[]>([...INITIAL_MESSAGES]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [chatActive, setChatActive] = useState(false);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    setQuery(suggestion);

    // Focus input after setting suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
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

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      {/* Header - Fixed position with consistent blur and transition */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between py-3 px-6 bg-[#0A0A0A]/90 backdrop-blur-lg transition-all duration-300">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = '/'}
            className="font-medium text-sm tracking-wide text-white hover:text-accent transition-colors flex items-center"
          >
            <SparklesIcon className="h-4 w-4 mr-1.5" />
            Quran AI
          </button>
          {threadId && (
            <div className="flex items-center">
              <span className="text-xs text-white/40 ml-2">•</span>
              <span className="text-xs text-white/40 ml-2">Thread {threadId.split('-')[0]}</span>
            </div>
          )}

        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-2"
            onClick={handleNewChat}
          >
            <span>New Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-2"
            onClick={() => setCommandDialogOpen(true)}
          >
            <span>Commands</span>
            <kbd className="ml-1.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium">⌘ K</kbd>
          </Button>
        </div>
      </header>

      {/* Main content - Centered when empty with padding for fixed header */}
      <main className={`flex-1 flex flex-col ${!chatActive || messages.length <= 2 ? "justify-center" : "justify-start pt-10"
        } overflow-hidden pt-12 pb-24`}>
        {/* Logo and title - Only visible when chat is not active */}
        <div className={`flex flex-col items-center transition-all duration-500 ease-in-out px-6 ${chatActive && messages.length > 2 ? "opacity-0 max-h-0 overflow-hidden" : "opacity-100 mb-16"
          }`}>
          {/* Raycast-inspired logo with enhanced glow effect and subtle animation */}
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full transform scale-110 opacity-40 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-accent to-accent/80 p-5 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
              <SparklesIcon className="h-10 w-10 text-white animate-[spin_20s_linear_infinite]" />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3 tracking-tight text-white">Quran AI</h1>
          <p className="text-white/70 text-base max-w-lg text-center mb-12 leading-relaxed">
            Explore the Quran through an interactive AI assistant. Ask questions, discover connections, and gain deeper insights.
          </p>

          {/* Raycast-inspired suggestion cards - Refined to match screenshot */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xl mb-14">
            {SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                className="group flex items-center text-left py-3 px-4 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center mr-3">
                  <SparklesIcon className="h-3 w-3 text-accent" />
                </div>
                <span className="text-xs text-white/80 font-medium truncate">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages - Centered container with scroll indicator */}
        <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-6 relative ${chatActive && messages.length > 2 ? "opacity-100 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" : "opacity-0 max-h-0"
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
        <div className="fixed bottom-0 left-0 right-0 z-10 w-full px-6 py-4 bg-[#0A0A0A]/90 backdrop-blur-lg transition-all duration-300">
          <div className="max-w-xl mx-auto">
            {/* Input form - Matching screenshot */}
            <div className="relative rounded-lg overflow-hidden bg-white/[0.04] backdrop-blur-md border border-white/[0.06]">
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about the Quran..."
                  className="border-0 bg-transparent text-white py-3 px-4 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:ring-offset-0 placeholder:text-white/30 transition-all duration-200"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-accent/10 hover:bg-accent/20 transition-all duration-200 hover:scale-110"
                    disabled={!query.trim() || isLoading}
                  >
                    <SendIcon className="h-3 w-3 text-accent group-hover:text-accent-foreground transition-colors" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </form>
            </div>

            {/* Experimental warning message with accuracy disclaimer */}
            <div className="flex items-center justify-center mt-4">
              <p className="text-[10px] text-white/30 italic text-center">
                ✧ Experimental research preview - Please verify information for accuracy
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Command Dialog */}
      <HomeCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
    </div>
  );
}
