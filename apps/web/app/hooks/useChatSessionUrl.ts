import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Custom hook to synchronize the chat session ID between the component's state and the browser's URL.
 *
 * Ensures the session ID is present in the URL for persistence and sharing.
 *
 * @param sessionId The current session ID from the component's state.
 */
export function useChatSessionUrl(sessionId: string | null) {
  const location = useLocation();

  useEffect(() => {
    // Only run in the browser
    if (typeof window === 'undefined' || !sessionId || sessionId === 'server-session') {
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const urlSession = urlParams.get('session');

    // Update URL with session ID if not already present
    if (!urlSession) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('session', sessionId);
        // Use replaceState to avoid adding multiple history entries on re-renders
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL with session ID:', error);
      }
    }
  }, [sessionId, location.search]); // Depend on sessionId and location.search to react to changes
} 