import React, { useState, useRef, useEffect } from 'react';

interface RelationshipExpandDropdownProps {
  relationshipType: string;
  direction: 'incoming' | 'outgoing' | 'both';
  onExpand: (relType: string, direction: string) => void;
}

export function RelationshipExpandDropdown({
  relationshipType,
  direction,
  onExpand
}: RelationshipExpandDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs bg-secondary hover:bg-secondary/80 text-sidebar-foreground px-2 py-1 rounded-md font-medium flex items-center border border-sidebar-border"
      >
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Expand
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-card rounded-md shadow-lg z-10 border border-sidebar-border backdrop-blur-xl">
          <div className="py-1">
            {direction !== 'incoming' && (
              <button
                onClick={() => {
                  onExpand(relationshipType, 'outgoing');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-sidebar-foreground hover:bg-secondary/30 flex items-center"
              >
                <svg className="w-3 h-3 mr-2 text-sidebar-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Outgoing
              </button>
            )}

            {direction !== 'outgoing' && (
              <button
                onClick={() => {
                  onExpand(relationshipType, 'incoming');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-sidebar-foreground hover:bg-secondary/30 flex items-center"
              >
                <svg className="w-3 h-3 mr-2 text-sidebar-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Incoming
              </button>
            )}

            <button
              onClick={() => {
                onExpand(relationshipType, 'both');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs text-sidebar-foreground hover:bg-secondary/30 flex items-center"
            >
              <svg className="w-3 h-3 mr-2 text-sidebar-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18m-7 4l4 4m0 0l-4 4m4-4H3" />
              </svg>
              Both Directions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
