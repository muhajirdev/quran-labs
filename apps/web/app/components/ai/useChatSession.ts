import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

interface UseChatSessionOptions {
  initialSessionId?: string;
  localStorageKey?: string;
  urlParam?: string;
}

export function useChatSession({
  initialSessionId,
  localStorageKey = 'quran-ai-session-id',
  urlParam = 'session',
}: UseChatSessionOptions = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sessionId, setSessionId] = useState<string>(() => {
    // Return initial session ID if provided
    if (initialSessionId) return initialSessionId;
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'server-session';
    }

    // Check URL for session parameter first
    const urlParams = new URLSearchParams(location.search);
    const urlSession = urlParams.get(urlParam);
    if (urlSession) {
      return urlSession;
    }

    // Check localStorage for existing session
    try {
      const storedSession = localStorage.getItem(localStorageKey);
      if (storedSession) {
        return storedSession;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    // Generate a new session ID if none exists
    return generateNewSessionId(localStorageKey);
  });

  // Update URL when sessionId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    if (sessionId && sessionId !== 'server-session') {
      params.set(urlParam, sessionId);
    } else {
      params.delete(urlParam);
    }

    // Update URL without triggering a page reload
    navigate(
      {
        pathname: url.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, [sessionId, urlParam, navigate]);

  // Generate a new session ID
  const createNewSession = (): string => {
    const newSessionId = generateNewSessionId(localStorageKey);
    setSessionId(newSessionId);
    return newSessionId;
  };

  // Clear the current session
  const clearSession = () => {
    try {
      if (localStorageKey) {
        localStorage.removeItem(localStorageKey);
      }
    } catch (error) {
      console.error('Error clearing session from localStorage:', error);
    }
    createNewSession();
  };

  return {
    sessionId,
    createNewSession,
    clearSession,
  };
}

// Helper function to generate a new session ID
function generateNewSessionId(localStorageKey: string): string {
  const newSessionId = `session-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
    
  try {
    if (localStorageKey) {
      localStorage.setItem(localStorageKey, newSessionId);
    }
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
  
  return newSessionId;
}
