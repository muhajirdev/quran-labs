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
import { useNavigate, useLocation } from "react-router"
import { ChatMessage } from "./ChatMessage"
import { createChatCompletion } from "~/lib/openrouter"

// Suggestion chips for the homepage
const SUGGESTIONS = [
  { text: "What does the Quran say about patience?", icon: <BookIcon className="h-3 w-3" /> },
  { text: "Find verses about forgiveness", icon: <SearchIcon className="h-3 w-3" /> },
  { text: "Explain the first chapter of the Quran", icon: <BookMarkedIcon className="h-3 w-3" /> },
  { text: "How to deal with anxiety in Islam?", icon: <BrainCircuitIcon className="h-3 w-3" /> },
  { text: "Compare translations of verse 2:255", icon: <LayersIcon className="h-3 w-3" /> },
  { text: "Show me connections between mercy and forgiveness", icon: <NetworkIcon className="h-3 w-3" /> },
];

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "system",
    content: "You are a helpful AI assistant specialized in the Quran and Islamic knowledge."
  },
  {
    role: "assistant",
    content: "I'm your Quran AI Assistant. Ask me anything about the Quran, its verses, chapters, themes, or interpretations."
  }
]

export function AIChatExperience() {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if there's a query parameter in the URL
  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get('q');
    const aiMode = new URLSearchParams(location.search).get('ai');

    if (urlQuery) {
      setQuery(urlQuery);
      setChatActive(true);
      // Submit the query automatically
      handleQuerySubmission(urlQuery);
    } else if (aiMode === 'true') {
      // Just activate the chat interface without a query
      setChatActive(true);
    } else {
      // Ensure chat is not active when no parameters are present
      setChatActive(false);
    }
  }, [location.search]);

  // Focus the input field when the page loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (!chatActive) {
        // First query - update URL and activate chat
        navigate(`/?q=${encodeURIComponent(query.trim())}`);
        setChatActive(true);
      }
      handleQuerySubmission(query);
    }
  };

  // Process the query and get AI response
  const handleQuerySubmission = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: queryText
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      // Add a placeholder message for the loading state
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      const response = await createChatCompletion({
        messages: [...messages, userMessage],
        temperature: 0.7,
        max_tokens: 500
      });

      // Replace the placeholder with the actual response
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        response.choices[0].message
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Replace the placeholder with an error message
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    // Focus the input after setting the suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header - Fixed position with consistent blur */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between py-3 px-6 bg-black/80 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm tracking-wide text-white">Quran AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white text-xs h-7 px-2"
          >
            <span>Explore</span>
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
          {/* Raycast-inspired logo with enhanced glow effect */}
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-accent/30 blur-2xl rounded-full transform scale-110 opacity-40"></div>
            <div className="relative bg-gradient-to-br from-accent to-accent/80 p-5 rounded-full shadow-lg">
              <SparklesIcon className="h-10 w-10 text-white" />
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

        {/* Chat Messages - Centered container */}
        <div className={`w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-6 ${chatActive && messages.length > 2 ? "opacity-100 flex-1 overflow-y-auto" : "opacity-0 max-h-0"
          }`}>
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

        {/* Input area - Fixed at bottom with consistent blur */}
        <div className="fixed bottom-0 left-0 right-0 z-10 w-full px-6 py-4 bg-black/80 backdrop-blur-lg">
          <div className="max-w-xl mx-auto">
            {/* Input form - Matching screenshot */}
            <div className="relative rounded-lg overflow-hidden bg-white/[0.04] backdrop-blur-md border border-white/[0.06]">
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about the Quran..."
                  className="border-0 bg-transparent text-white py-3 px-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors"
                    disabled={!query.trim() || isLoading}
                  >
                    <SendIcon className="h-3 w-3 text-accent" />
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
