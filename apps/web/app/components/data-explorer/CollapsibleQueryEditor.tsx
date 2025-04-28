import React, { useState } from 'react';
import { Button } from '~/components/ui/button';
import { ChevronDown, ChevronUp, Play } from 'lucide-react';

interface CollapsibleQueryEditorProps {
  query: string;
  setQuery: (query: string) => void;
  executeQuery: () => void;
  loading: boolean;
}

export function CollapsibleQueryEditor({
  query,
  setQuery,
  executeQuery,
  loading
}: CollapsibleQueryEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden backdrop-blur-xl mb-6">
      <div className="bg-secondary/20 px-6 py-3 border-b border-border flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-foreground">Cypher Query</h2>
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-2 h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? 'Expand' : 'Collapse'} query editor
            </span>
          </Button>
        </div>
        <Button
          onClick={executeQuery}
          disabled={loading}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-secondary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Execute Query</span>
            </>
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          <textarea
            id="query"
            className="w-full h-32 p-4 border border-border rounded-md font-mono text-foreground bg-background/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your Cypher query here..."
          />
        </div>
      )}
    </div>
  );
}
