"use client"

import { useAtom } from "jotai";
import type { LucideIcon } from "lucide-react";
import { SparklesIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { chatMessagesAtom, chatMinimizedAtom } from "~/store/chat";
import type { Message } from "~/components/ai/FloatingChatInterface";

// Define the option item interface
export interface AIOption {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string | ((context: AIContext) => string);
}

// Define the context that will be passed to prompt functions
export interface AIContext {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  [key: string]: any; // Allow for additional context properties
}

// Define the component props
export interface AskAIButtonProps {
  // Core props
  context: AIContext;
  options?: AIOption[];
  defaultPrompt?: string | ((context: AIContext) => string);

  // UI customization
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  buttonLabel?: string;
  align?: 'start' | 'center' | 'end';

  // Callbacks
  onPromptSent?: (prompt: string) => void;
}

export function AskAIButton({
  // Core props with defaults
  context,
  options,
  defaultPrompt = (ctx) => `Tell me about this ${ctx.entityType || 'item'} ${ctx.entityId ? `(${ctx.entityId})` : ''}${ctx.entityName ? `: ${ctx.entityName}` : ''}`,

  // UI customization with defaults
  size = 'md',
  className = '',
  buttonLabel,
  align = 'end',

  // Callbacks
  onPromptSent
}: AskAIButtonProps) {
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom);
  const [, setChatMinimized] = useAtom(chatMinimizedAtom);

  // Function to send a message to the AI chat and generate a response
  const sendPrompt = async (prompt: string | ((context: AIContext) => string)) => {
    // If prompt is a function, call it with the context
    const promptText = typeof prompt === 'function' ? prompt(context) : prompt;

    // Create the user message
    const userMessage: Message = {
      role: "user",
      content: promptText
    };

    // Update the chat state with user message
    setChatMessages([...chatMessages, userMessage]);
    setChatMinimized(false);

    // Generate a simple AI response if no callback is provided
    if (!onPromptSent) {
      // Create a placeholder response based on the context
      let responseText = "";

      if (promptText.includes("relevant to my life")) {
        responseText = `${context.entityType === 'verse' ? 'Verse' : 'Chapter'} ${context.entityId} contains wisdom that can be personally relevant to you. It speaks about ${context.entityType === 'verse' ? 'principles' : 'themes'} that can guide your daily decisions and provide perspective on life's challenges.`;
      } else if (promptText.includes("key lessons")) {
        responseText = `The key lessons from ${context.entityType === 'verse' ? 'verse' : 'chapter'} ${context.entityId} include guidance on moral conduct, spiritual growth, and the relationship between humans and their Creator.`;
      } else if (promptText.includes("historical context")) {
        responseText = `${context.entityType === 'verse' ? 'Verse' : 'Chapter'} ${context.entityId} was revealed during a significant period in Islamic history, providing context for understanding its message and application.`;
      } else if (promptText.includes("scholars say")) {
        responseText = `Scholars have provided various interpretations of ${context.entityType === 'verse' ? 'verse' : 'chapter'} ${context.entityId}, emphasizing different aspects of its meaning and significance.`;
      } else if (promptText.includes("apply") && promptText.includes("today")) {
        responseText = `${context.entityType === 'verse' ? 'Verse' : 'Chapter'} ${context.entityId} can be applied today by understanding its core principles and adapting them to contemporary situations and challenges.`;
      } else if (promptText.includes("explain") || promptText.includes("tell me about")) {
        responseText = `${context.entityType === 'verse' ? 'Verse' : 'Chapter'} ${context.entityId} ${context.text ? `says: "${context.text}"` : ''} and addresses important spiritual and ethical principles that guide believers.`;
      } else {
        responseText = `I'd be happy to discuss ${context.entityType === 'verse' ? 'verse' : 'chapter'} ${context.entityId} with you. What specific aspect would you like to explore?`;
      }

      // Add AI response to chat
      const aiResponse: Message = {
        role: "assistant",
        content: responseText
      };

      // Update chat with AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, aiResponse]);
      }, 500); // Small delay to simulate AI thinking
    }
    // Call the callback if provided to get a real response
    else {
      onPromptSent(promptText);
    }
  };

  // Get the appropriate button size based on the size prop
  const buttonSize = {
    'sm': "h-6 w-6 sm:h-7 sm:w-7",
    'md': "h-7 w-7 sm:h-8 sm:w-8",
    'lg': "h-8 w-8 sm:h-9 sm:w-9"
  }[size];

  const iconSize = {
    'sm': "h-3 w-3 sm:h-3.5 sm:w-3.5",
    'md': "h-3.5 w-3.5 sm:h-4 sm:w-4",
    'lg': "h-4 w-4 sm:h-5 sm:w-5"
  }[size];

  // Default options if none provided
  const defaultOptions: AIOption[] = [
    {
      id: 'general',
      label: `Tell me about this ${context.entityType || 'item'}`,
      icon: SparklesIcon,
      prompt: defaultPrompt
    }
  ];

  // Use provided options or defaults
  const menuOptions = options || defaultOptions;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonSize} rounded-full border-0 bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent shadow-sm ${className}`}
        >
          <SparklesIcon className={iconSize} />
          <span className="sr-only">
            {buttonLabel || `Ask AI about this ${context.entityType || 'item'}`}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-[#121212] border border-white/10"
        align={align}
        sideOffset={5}
      >
        <div className="grid gap-1 p-1">
          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-accent/10 hover:text-accent transition-colors rounded-sm"
                onClick={() => sendPrompt(option.prompt)}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
