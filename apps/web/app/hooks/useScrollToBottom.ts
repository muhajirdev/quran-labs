import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { UIMessage } from 'ai';

interface UseScrollToBottomOptions {
  messages: UIMessage[];
  chatActive: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook to automatically scroll the chat message area to the bottom.
 *
 * Useful for chat or continuously updating feeds to show the latest content.
 *
 * @param options - Options for the hook.
 * @param options.messages The array of chat messages. Changes to this array trigger scrolling.
 * @param options.chatActive A boolean indicating if the chat is active. Scrolling only happens when true.
 * @param options.messagesEndRef A React RefObject attached to the element at the bottom of the scrollable area.
 */
export function useScrollToBottom({ messages, chatActive, messagesEndRef }: UseScrollToBottomOptions) {
  useEffect(() => {
    // Only scroll if chat is active and the ref is attached
    if (chatActive && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatActive, messagesEndRef]); // Depend on messages, chatActive, and messagesEndRef
} 