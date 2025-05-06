// Thread management utility for chat conversations
import { getSystemMessage } from './system-prompt';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const THREADS_STORAGE_KEY = 'quran-ai-threads';
const CURRENT_THREAD_KEY = 'quran-ai-current-thread';

// Initial system messages for new threads
export const INITIAL_MESSAGES: Message[] = [
  getSystemMessage(),
  {
    role: 'assistant',
    content: 'I\'m your Quran AI Assistant. Ask me anything about the Quran, its verses, chapters, themes, or interpretations. I\'ll do my best to provide accurate, helpful information.'
  }
];

// Get all threads from localStorage
export function getAllThreads(): Thread[] {
  try {
    const threadsJson = localStorage.getItem(THREADS_STORAGE_KEY);
    if (!threadsJson) return [];

    const threads = JSON.parse(threadsJson) as Thread[];
    return threads.sort((a, b) => b.updatedAt - a.updatedAt); // Sort by most recent
  } catch (error) {
    console.error('Error retrieving threads:', error);
    return [];
  }
}

// Get a specific thread by ID
export function getThreadById(threadId: string): Thread | null {
  const threads = getAllThreads();
  return threads.find(thread => thread.id === threadId) || null;
}

// Generate a simple thread ID (timestamp + random string)
function generateThreadId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

// Create a new thread
export function createThread(): Thread {
  const threads = getAllThreads();

  // Create a new thread
  const newThread: Thread = {
    id: generateThreadId(),
    title: 'New Conversation',
    messages: [...INITIAL_MESSAGES],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  threads.push(newThread);
  localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));

  return newThread;
}

// Update a thread with new messages
export function updateThread(threadId: string, messages: Message[]): Thread | null {
  const threads = getAllThreads();
  const threadIndex = threads.findIndex(thread => thread.id === threadId);

  if (threadIndex === -1) return null;

  threads[threadIndex].messages = messages;
  threads[threadIndex].updatedAt = Date.now();

  // Generate a title from the first user message if it's a new thread with default title
  if (
    threads[threadIndex].title === 'New Conversation' &&
    messages.length > 2 &&
    messages[2].role === 'user'
  ) {
    const firstUserMessage = messages[2].content;
    // Truncate to first 30 characters or first sentence
    const title = firstUserMessage.split(/[.!?]/)[0].trim();
    threads[threadIndex].title = title.length > 30 ? `${title.substring(0, 27)}...` : title;
  }

  localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  return threads[threadIndex];
}

// Set the current active thread
export function setCurrentThread(threadId: string): void {
  localStorage.setItem(CURRENT_THREAD_KEY, threadId);
}

// Get or create a thread
export function getOrCreateThread(threadId: string | null): Thread {
  // If threadId is provided, try to get that specific thread
  if (threadId) {
    const existingThread = getThreadById(threadId);
    if (existingThread) {
      return existingThread;
    }
  }

  // Create a new thread
  return createThread();
}
