"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { lazy, Suspense } from "react";
import { Logo } from "~/components/ui/logo";
import type { UIMessage } from "ai";
import { ToolInvocationSheet } from "./ToolInvocationSheet";
import { SongAnalysisCard } from "./tools/SongAnalysisCard";
import { VerseReferenceCard } from "./tools/VerseReferenceSheet";
const RenderMarkdown = lazy(() => import("./MarkdownRenderer"));

interface ChatMessageProps {
  message: UIMessage;
  isLoading?: boolean;
  isLastMessage?: boolean; // Added to support the isLastMessage prop
}

function LoadingDots() {
  return (
    <div className="flex items-center space-x-1.5 min-h-[26.5px]">
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_0ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_160ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_320ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
    </div>
  );
}

export function ChatMessage({
  message,
  isLoading,
  isLastMessage,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [isVisible, setIsVisible] = React.useState(false);
  const [activeToolInvocation, setActiveToolInvocation] = React.useState<{
    isOpen: boolean;
    toolName: string;
    toolState: "partial-call" | "call" | "result";
    args: any;
    result?: any;
  } | null>(null);

  // Add a slight delay before showing the message for a staggered animation effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Render message parts
  const renderMessageParts = () => {
    if (!message.parts?.length) {
      return <RenderMarkdown content={message.content} />;
    }

    return message.parts.map((part, index) => {
      if (part.type === "text") {
        return <RenderMarkdown key={index} content={part.text} />;
      }

      if (part.type === "step-start") {
        return index > 0 ? (
          <div key={index} className="my-3">
            <hr className="border-white/10" />
          </div>
        ) : null;
      }

      if (part.type === "tool-invocation") {
        const toolInvocation = part.toolInvocation;

        // Special case: render comprehensive song analysis directly inline
        if (toolInvocation.toolName === "comprehensiveSongAnalysis") {
          return (
            <div key={index} className="my-4">
              <SongAnalysisCard
                state={toolInvocation.state}
                args={toolInvocation.args}
                result={
                  toolInvocation.state === "result"
                    ? toolInvocation.result
                    : undefined
                }
              />
            </div>
          );
        }

        // Render different tool invocations based on tool name
        if (toolInvocation.toolName === "fetchLyrics") {
          // Lyrics tool invocation
          return (
            <div key={index} className="my-3">
              <div
                className="p-3 bg-black/20 border border-accent/10 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() =>
                  setActiveToolInvocation({
                    isOpen: true,
                    toolName: toolInvocation.toolName,
                    toolState: toolInvocation.state,
                    args: toolInvocation.args,
                    result:
                      toolInvocation.state === "result"
                        ? toolInvocation.result
                        : undefined,
                  })
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-lg">🎵</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {toolInvocation.args.songTitle || "Song Lyrics"}
                      </h4>
                      {toolInvocation.state === "partial-call" && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          Loading...
                        </span>
                      )}
                      {toolInvocation.state === "result" && (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          View lyrics
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {toolInvocation.state === "result"
                        ? "Click to view full lyrics"
                        : "Fetching lyrics..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (toolInvocation.toolName === "verseReference") {
          // Render VerseReferenceCard directly inline
          return (
            <div key={index} className="my-6">
              <VerseReferenceCard
                state={toolInvocation.state}
                args={toolInvocation.args}
                result={
                  toolInvocation.state === "result"
                    ? toolInvocation.result
                    : undefined
                }
              />
            </div>
          );
        }

        // Generic tool invocation
        return (
          <div key={index} className="my-3">
            <div
              className="p-3 bg-black/20 border border-accent/10 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
              onClick={() =>
                setActiveToolInvocation({
                  isOpen: true,
                  toolName: toolInvocation.toolName,
                  toolState: toolInvocation.state,
                  args: toolInvocation.args,
                  result:
                    toolInvocation.state === "result"
                      ? toolInvocation.result
                      : undefined,
                })
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-lg">🔧</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white capitalize">
                      {toolInvocation.toolName
                        .replace(/([A-Z])/g, " $1")
                        .trim()}
                    </h4>
                    {toolInvocation.state === "partial-call" && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        Processing...
                      </span>
                    )}
                    {toolInvocation.state === "result" && (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        View results
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {toolInvocation.state === "result"
                      ? "Click to view details"
                      : "Processing request..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (part.type === "file" && part.mimeType?.startsWith("image/")) {
        return (
          <div key={index} className="my-2">
            <img
              src={`data:${part.mimeType};base64,${part.data}`}
              alt="Generated image"
              className="max-w-full rounded-md"
            />
          </div>
        );
      }

      // For any other part types we don't handle yet
      return null;
    });
  };

  // Render user message parts
  const renderUserMessageParts = () => {
    if (!message.parts?.length) {
      return message.content;
    }

    return message.parts.map((part, index) => {
      if (part.type === "text") {
        return <span key={index}>{part.text}</span>;
      }
      return null;
    });
  };

  return (
    <>
      {activeToolInvocation && (
        <ToolInvocationSheet
          isOpen={activeToolInvocation.isOpen}
          onClose={() => setActiveToolInvocation(null)}
          toolName={activeToolInvocation.toolName}
          toolState={activeToolInvocation.toolState}
          args={activeToolInvocation.args}
          result={activeToolInvocation.result}
        />
      )}
      <div
        className={cn(
          "w-full transition-all duration-300 ease-out",
          isVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-2"
        )}
      >
        {isUser ? (
          <div className="flex justify-end mb-4">
            <div className="bg-white/[0.03] rounded-2xl rounded-tr-sm py-2.5 px-3.5 max-w-[85%]">
              <div className="text-sm text-white/80 leading-relaxed">
                {renderUserMessageParts()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            {isLoading ? (
              <LoadingDots />
            ) : (
              <Suspense fallback={<LoadingDots />}>
                <div className="">{renderMessageParts()}</div>
              </Suspense>
            )}
          </div>
          // <div className="mb-5">
          //   <div className="flex items-start gap-3">
          //     <div className="flex-shrink-0 mt-0.5 relative group">
          //       {/* Subtle glow effect */}
          //       <div className="absolute inset-[-2px] bg-accent rounded-full blur-[6px] opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
          //       <div className="relative">
          //         <Logo size="sm" className="w-6 h-6" />
          //       </div>
          //     </div>
          //   </div>
          // </div>
        )}
      </div>
    </>
  );
}
