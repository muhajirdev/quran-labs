"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet"
import { cn } from "~/lib/utils"
import { FetchLyricsResult } from "./tools/FetchLyricsSheet"
import { VerseReferenceSheet } from "./tools/VerseReferenceSheet"

interface ToolInvocationSheetProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  toolState: 'partial-call' | 'call' | 'result'
  args: any
  result?: any
}

export function ToolInvocationSheet({
  isOpen,
  onClose,
  toolName,
  toolState,
  args,
  result
}: ToolInvocationSheetProps) {
  // Render different tool UIs based on the tool name
  const renderToolContent = () => {
    switch (toolName) {
      case 'fetchLyrics':
        return (
          <FetchLyricsResult
            state={toolState}
            args={args}
            result={result}
          />
        )
      case 'verseReference':
        return (
          <VerseReferenceSheet
            state={toolState}
            args={args}
            result={result}
          />
        )
      default:
        return <GenericToolResult state={toolState} args={args} result={result} />
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="bg-background/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-accent flex items-center gap-2">
            {toolName === 'fetchLyrics' && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10">
                🎵
              </span>
            )}
            {toolName === 'verseReference' && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10">
                📖
              </span>
            )}
            {toolName !== 'fetchLyrics' && toolName !== 'verseReference' && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/10">
                🔧
              </span>
            )}
            {toolName === 'fetchLyrics' ? 'Song Lyrics' :
              toolName === 'verseReference' ? 'Quran Verse' :
                toolName}
          </SheetTitle>
          <SheetDescription>
            {toolState === 'partial-call' && 'Loading...'}
            {toolState === 'call' && 'Processing...'}
            {toolState === 'result' && 'Results'}
          </SheetDescription>
        </SheetHeader>

        {renderToolContent()}
      </SheetContent>
    </Sheet>
  )
}

// Generic tool result component for tools without specialized UI
function GenericToolResult({ state, args, result }: { state: string, args: any, result?: any }) {
  // Format the result for better display
  const formatToolResult = (result: any) => {
    if (typeof result === 'string') {
      try {
        // Try to parse as JSON if it looks like JSON
        if (result.startsWith('{') && result.endsWith('}')) {
          const parsed = JSON.parse(result);
          return parsed;
        }
      } catch (e) {
        // If parsing fails, just return the original string
      }
    }
    return result;
  };

  const formattedResult = result ? formatToolResult(result) : null;

  return (
    <div className="space-y-4">
      {(state === 'call' || state === 'result') && (
        <div className="bg-black/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-accent mb-2">Request Details</h3>
          <div className="text-sm text-white/80 bg-black/20 p-3 rounded-md overflow-x-auto">
            {Object.entries(args).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="text-white/60">{key}:</span> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {state === 'result' && (
        <div className="bg-black/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-accent mb-2">Result</h3>
          <div className="text-sm text-white/80 bg-black/20 p-3 rounded-md overflow-x-auto">
            {typeof formattedResult === 'object'
              ? Object.entries(formattedResult).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="text-white/60">{key}:</span> {JSON.stringify(value)}
                </div>
              ))
              : String(formattedResult)
            }
          </div>
        </div>
      )}
    </div>
  )
}
