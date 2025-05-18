"use client"

import * as React from "react"
import { Sheet } from "@silk-hq/components"
import { cn } from "~/lib/utils"
import { FetchLyricsResult } from "./tools/FetchLyricsSheet"
import { VerseReferenceSheet } from "./tools/VerseReferenceSheet"
import { X } from "lucide-react"

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

  const [presented, setPresented] = React.useState(false);

  // Update presented state when isOpen changes
  React.useEffect(() => {
    setPresented(isOpen);
  }, [isOpen]);

  return (
    <Sheet.Root
      license="commercial"
      presented={presented}
      onPresentedChange={(isPresented) => {
        setPresented(isPresented);
        if (!isPresented) {
          // Allow animation to complete before calling onClose
          setTimeout(() => {
            onClose();
          }, 300); // 300ms should be enough for most animations
        }
      }}
    >
      <Sheet.Portal>
        <Sheet.View nativeEdgeSwipePrevention={true} >
          <Sheet.Backdrop themeColorDimming="auto" className="bg-black/60 backdrop-blur-md" />
          <Sheet.Content className="max-w-[700px] mx-auto bg-background dark:bg-[#191919] rounded-t-[24px] shadow-xl max-h-[85vh] overflow-y-auto border-t border-border/50 dark:border-[rgba(58,58,58,0.7)]">
            <Sheet.BleedingBackground />

            {/* Header */}
            <div className="p-5 mb-2 border-b border-border/50 dark:border-[rgba(58,58,58,0.7)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  {toolName === 'fetchLyrics' && (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 relative">
                      <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
                      <span className="text-xl relative z-10">🎵</span>
                    </span>
                  )}
                  {toolName === 'verseReference' && (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 relative">
                      <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
                      <span className="text-xl relative z-10">📖</span>
                    </span>
                  )}
                  {toolName !== 'fetchLyrics' && toolName !== 'verseReference' && (
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 relative">
                      <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
                      <span className="text-xl relative z-10">🔧</span>
                    </span>
                  )}
                  <Sheet.Title className="text-foreground dark:text-[#EEEEEE] font-medium text-lg">
                    {toolName === 'fetchLyrics' ? 'Song Lyrics' :
                      toolName === 'verseReference' ? 'Quran Verse' :
                        toolName}
                  </Sheet.Title>
                </div>
                <Sheet.Trigger action="dismiss" className="p-2 rounded-full hover:bg-secondary/50 dark:hover:bg-[#3A3A3A] transition-colors">
                  <X className="h-4 w-4 text-foreground dark:text-[#B3B3B3]" />
                </Sheet.Trigger>
              </div>
              <Sheet.Description className="text-sm text-muted-foreground dark:text-[#7B7B7B] mt-2">
                {toolState === 'partial-call' && 'Loading...'}
                {toolState === 'call' && 'Processing...'}
                {toolState === 'result' && 'Results'}
              </Sheet.Description>
            </div>

            {/* Content */}
            <div className="px-4 pb-8">
              {renderToolContent()}
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
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
    <div className="space-y-6">
      {(state === 'call' || state === 'result') && (
        <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-5">
          <h3 className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/10">
              <span className="text-xs">📝</span>
            </span>
            Request Details
          </h3>
          <div className="text-sm text-foreground dark:text-white/80 bg-secondary/50 dark:bg-black/30 p-4 rounded-md overflow-x-auto border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            {Object.entries(args).map(([key, value]) => (
              <div key={key} className="mb-3 last:mb-0">
                <span className="text-muted-foreground dark:text-white/60 font-medium">{key}:</span> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        </div>
      )}

      {state === 'result' && (
        <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-5">
          <h3 className="text-sm font-medium text-accent mb-4 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/10">
              <span className="text-xs">✅</span>
            </span>
            Result
          </h3>
          <div className="text-sm text-foreground dark:text-white/80 bg-secondary/50 dark:bg-black/30 p-4 rounded-md overflow-x-auto border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            {typeof formattedResult === 'object'
              ? Object.entries(formattedResult).map(([key, value]) => (
                <div key={key} className="mb-3 last:mb-0">
                  <span className="text-muted-foreground dark:text-white/60 font-medium">{key}:</span> {JSON.stringify(value)}
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
