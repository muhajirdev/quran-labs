import * as React from "react";
import { cn } from "~/lib/utils";
import { ChatMessage } from "./ChatMessage";
import type { UIMessage } from "ai";
import type { RefObject } from "react";
import { useScrollToBottom } from "~/hooks/useScrollToBottom";

interface ChatMessagesViewProps {
  messages: UIMessage[];
  isLoading: boolean;
  chatActive: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const ChatMessagesView: React.FC<ChatMessagesViewProps> = ({
  messages,
  isLoading,
  chatActive,
  messagesEndRef,
}) => {
  // Use the custom hook for scrolling
  useScrollToBottom({ messages, chatActive, messagesEndRef });

  return (
    <div
      className={cn(
        `w-full max-w-3xl mx-auto transition-all duration-500 ease-in-out px-3 sm:px-6 relative ${
          chatActive
            ? "opacity-100 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            : "opacity-0 max-h-0"
        }`
      )}
    >
      {/* Messages container */}
      <div className="space-y-6 pb-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLastMessage={index === messages.length - 1}
            isLoading={index === messages.length - 1 && isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
