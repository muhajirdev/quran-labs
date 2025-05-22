import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook to automatically focus a specified input field when the component mounts.
 *
 * Provides a better user experience by allowing immediate typing.
 *
 * @param inputRef A React RefObject attached to the input element to focus.
 */
export function useFocusInputOnMount(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    // Only run in the browser and if the ref is attached
    if (typeof window !== 'undefined' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]); // Depend on inputRef to ensure it runs when the ref is available
} 