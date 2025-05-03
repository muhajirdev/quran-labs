"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { SparklesIcon, SendIcon, BookIcon, SearchIcon, BookMarkedIcon, BrainCircuitIcon, LayersIcon, NetworkIcon } from "lucide-react"
import { ChatMessage } from "./ChatMessage"
import { cn } from "~/lib/utils"
import { motion } from 'framer-motion'
import { useAtom } from "jotai"
import { chatMessagesAtom, chatMinimizedAtom } from "~/store/chat"

// Default suggestion chips
const DEFAULT_SUGGESTIONS = [
  { text: "What does the Quran say about patience?", icon: <BookIcon className="h-3 w-3" /> },
  { text: "Find verses about forgiveness", icon: <SearchIcon className="h-3 w-3" /> },
  { text: "Explain the first chapter of the Quran", icon: <BookMarkedIcon className="h-3 w-3" /> },
  { text: "How to deal with anxiety in Islam?", icon: <BrainCircuitIcon className="h-3 w-3" /> },
  { text: "Compare translations of verse 2:255", icon: <LayersIcon className="h-3 w-3" /> },
  { text: "Show me connections between mercy and forgiveness", icon: <NetworkIcon className="h-3 w-3" /> },
];

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "system",
    content: "You are a helpful AI assistant specialized in the Quran and Islamic knowledge."
  },
  {
    role: "assistant",
    content: "I'm here to help you explore and understand the Quran. You can ask me about meanings, contexts, or related topics."
  }
];

interface FloatingChatInterfaceProps {
  title?: string;
  contextId?: string;
  suggestions?: Array<{ text: string; icon: React.ReactNode }>;
  initialMessages?: Message[];
  onSendMessage?: (message: string) => Promise<string>;
  className?: string;
}

export function FloatingChatInterface({
  title = "AI Assistant",
  contextId,
  suggestions = DEFAULT_SUGGESTIONS,
  initialMessages = INITIAL_MESSAGES,
  onSendMessage,
  className
}: FloatingChatInterfaceProps) {
  // Chat state
  const [query, setQuery] = useState("");
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom);
  const [chatMinimized, setChatMinimized] = useAtom(chatMinimizedAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize messages with initialMessages if provided
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setChatMessages(initialMessages);
    }
  }, []);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle smooth animation between states
  const handleMinimizeToggle = (minimize: boolean) => {
    // Don't do anything if already animating
    if (isAnimating) return;

    setIsAnimating(true);

    // Create a reference to the button element for expanding animation
    const buttonElement = document.querySelector('.chat-button');
    const buttonRect = buttonElement?.getBoundingClientRect();

    // Default button dimensions if not found
    const buttonWidth = buttonRect?.width || 48;
    const buttonHeight = buttonRect?.height || 48;

    if (minimize) {
      // When minimizing: animate the chat container to the button position
      if (chatContainerRef.current) {
        // Get the current position and size
        const containerRect = chatContainerRef.current.getBoundingClientRect();

        // Calculate the scale factor (from container to button)
        const scaleX = buttonWidth / containerRect.width;
        const scaleY = buttonHeight / containerRect.height;

        // Apply animation styles - scale down to button size while maintaining position
        chatContainerRef.current.style.transition = "transform 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)";
        chatContainerRef.current.style.transformOrigin = "bottom right";
        chatContainerRef.current.style.transform = `scale(${scaleX}, ${scaleY})`;
        chatContainerRef.current.style.opacity = "0";

        // After animation completes, change state
        setTimeout(() => {
          setChatMinimized(true);
          setIsAnimating(false);
        }, 350);
      }
    } else {
      // When expanding: first change state, then animate from button to full size
      setChatMinimized(false);

      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          // Get the current container dimensions after state change
          const containerRect = chatContainerRef.current.getBoundingClientRect();

          // Calculate the scale factor (from button to container)
          const scaleX = buttonWidth / containerRect.width;
          const scaleY = buttonHeight / containerRect.height;

          // Initial state - scaled to button size
          chatContainerRef.current.style.transition = "none";
          chatContainerRef.current.style.transformOrigin = "bottom right";
          chatContainerRef.current.style.transform = `scale(${scaleX}, ${scaleY})`;
          chatContainerRef.current.style.opacity = "0";

          // Force reflow to ensure initial state is applied
          void chatContainerRef.current.offsetWidth;

          // Animate to full size
          chatContainerRef.current.style.transition = "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 350ms cubic-bezier(0.2, 0.8, 0.2, 1)";
          chatContainerRef.current.style.transform = "scale(1)";
          chatContainerRef.current.style.opacity = "1";

          // After animation completes
          setTimeout(() => {
            setIsAnimating(false);
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }, 400);
        }
      });
    }
  };

  // Focus input when chat is expanded
  useEffect(() => {
    if (inputRef.current && !chatMinimized && !isAnimating) {
      inputRef.current.focus();
    }
  }, [chatMinimized, isAnimating]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

      // Ensure chat is expanded with animation
      if (chatMinimized) {
        handleMinimizeToggle(false);
        // Delay query submission until animation completes
        setTimeout(() => {
          handleQuerySubmission(trimmedQuery);
        }, 300);
      } else {
        // Process the query immediately if already expanded
        handleQuerySubmission(trimmedQuery);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    if (!chatActive) {
      setChatActive(true);
    }
    if (chatMinimized) {
      handleMinimizeToggle(false);
      // Delay query submission until animation completes
      setTimeout(() => {
        handleQuerySubmission(text);
      }, 300);
    } else {
      handleQuerySubmission(text);
    }
  };

  // Process the query and get AI response
  const handleQuerySubmission = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      role: "user",
      content: queryText
    };

    // Update messages and set loading state
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Add placeholder for loading state
      setChatMessages([...updatedMessages, { role: "assistant", content: "" }]);

      let response = "";

      // Use the provided onSendMessage function if available
      if (onSendMessage) {
        response = await onSendMessage(queryText);
      } else {
        // Default fallback response if no handler is provided
        response = `I received your question about "${queryText}". This is a placeholder response since no message handler was provided.`;
      }

      // Update messages with AI response
      setChatMessages([...updatedMessages, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error generating response:", error);
      setChatMessages([...updatedMessages, { role: "assistant", content: "I'm sorry, I encountered an error while processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed z-20 flex justify-end",
        chatMinimized
          ? 'bottom-4 right-4 w-12 h-12' :
          'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[420px] max-w-[calc(100vw-32px)] ',
        className
      )}
      style={{
        transformOrigin: 'bottom right',
        borderRadius: chatMinimized ? '9999px' : '1rem',
        transition: isAnimating ? 'none' : 'width 400ms cubic-bezier(0.2, 0.8, 0.2, 1), height 400ms cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 400ms cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >


      {/* Minimized Chat Button */}
      {chatMinimized ? (
        <motion.button
          onClick={() => handleMinimizeToggle(false)}
          className="chat-button w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 border-2 border-white/10 rounded-full"
            initial={{ opacity: 0, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
              backgroundSize: '200%',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            className="absolute inset-0 bg-accent/30 blur-md rounded-full"
            initial={{ opacity: 0, scale: 1.1 }}
            whileHover={{ opacity: 0.4, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div className="relative z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <SparklesIcon className="h-5 w-5 text-white" />
            </motion.div>
            {chatMessages.length > initialMessages.length && (
              <motion.span
                className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        </motion.button>
      ) : (
        <div
          ref={chatContainerRef}
          className="w-full h-full bg-[#0A0A0A] backdrop-blur-xl border border-white/[0.03] rounded-2xl overflow-hidden flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.3)] relative"
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
            backgroundSize: '200%',
            backgroundPosition: 'center',
          }}></div>

          {/* Chat Header - Elegant with accent */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-gradient-to-r from-white/[0.01] via-white/[0.03] to-white/[0.01] relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center relative group">
                <SparklesIcon className="h-3 w-3 text-white group-hover:scale-110 transition-transform duration-300" />
                {/* Subtle ring around icon */}
                <div className="absolute inset-0 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"></div>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-sm text-white group-hover:tracking-wide transition-all duration-300">{title}</span>
                {contextId && (
                  <>
                    <span className="text-xs text-white/40 mx-1.5">•</span>
                    <span className="text-xs text-white/40">{contextId}</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-white/5 text-white/60 hover:text-white/90 transition-colors duration-300"
              onClick={() => handleMinimizeToggle(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 12H6" />
              </svg>
            </Button>
          </div>

          {/* Chat Messages - Clean with subtle accents */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
            {/* Subtle scroll indicator */}
            {chatMessages.length > 4 && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-6 flex justify-center items-center pointer-events-none opacity-30 animate-bounce">
                <div className="w-1 h-3 bg-accent/30 rounded-full"></div>
              </div>
            )}

            <div className="space-y-6">
              {chatMessages.slice(2).map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isLoading={isLoading && index === chatMessages.length - 3}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion chips - Elegant with accent hover effects */}
            {(!chatActive || chatMessages.length <= 2) && (
              <div className="mt-2 grid grid-cols-1 gap-2">
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    className="group flex items-center text-left py-2.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] hover:border-accent/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 relative overflow-hidden"
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    {/* Subtle animated pattern on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{
                      backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
                      backgroundSize: '200%',
                      backgroundPosition: 'center',
                    }}></div>

                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/5 flex items-center justify-center mr-3 transition-all duration-300 group-hover:bg-accent/10 relative z-10">
                      {suggestion.icon || <SparklesIcon className="h-3 w-3 text-accent" />}
                    </div>
                    <span className="text-xs text-white/70 group-hover:text-white transition-colors duration-300 relative z-10">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Form - Enhanced with ring effect */}
          <div className="border-t border-white/[0.05] p-3 bg-gradient-to-b from-white/[0.01] to-white/[0.03] relative z-10">
            <form onSubmit={handleSubmit} className="relative">
              <div className="rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.05] focus-within:border-accent/20 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all duration-300 group">
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={contextId ? `Ask about ${contextId}...` : "Ask a question..."}
                  className="border-0 bg-transparent text-white py-2.5 px-3 text-sm focus-visible:ring-1 focus-visible:ring-accent/30 focus-visible:ring-offset-0 placeholder:text-white/30 transition-all duration-300 focus:placeholder:text-white/50"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className={`h-6 w-6 rounded-full absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300 ${!query.trim() || isLoading ? 'text-white/20' : 'bg-accent/10 hover:bg-accent/20 hover:scale-110 text-accent'}`}
                  disabled={!query.trim() || isLoading}
                >
                  <SendIcon className="h-3 w-3" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>

            {/* Enhanced footer with subtle decorative elements */}
            <div className="flex items-center justify-center mt-3 relative">
              <div className="absolute left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

              <div className="px-2 py-1 relative">
                <p className="text-[9px] text-white/30 text-center flex flex-col sm:flex-row items-center gap-1 group">
                  <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
                  <span className="group-hover:text-white/40 transition-colors duration-300 text-center">
                    Experimental research preview
                  </span>
                  <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
