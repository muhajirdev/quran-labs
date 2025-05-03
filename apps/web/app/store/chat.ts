import { atom } from 'jotai';
import type { Message } from '~/components/ai/FloatingChatInterface';

// Initial messages for the chat
const initialMessages: Message[] = [
  {
    role: "system",
    content: "You are a helpful AI assistant specialized in the Quran and Islamic knowledge."
  },
  {
    role: "assistant",
    content: "I'm here to help you explore and understand the Quran. You can ask me about meanings, contexts, or related topics."
  }
];

// Chat state atoms
export const chatMessagesAtom = atom<Message[]>(initialMessages);
export const chatMinimizedAtom = atom<boolean>(true);

// Chat state atoms are defined above
