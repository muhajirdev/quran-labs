"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { SparklesIcon } from "lucide-react"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant" | "system"
    content: string
  }
  isLoading?: boolean
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [isVisible, setIsVisible] = React.useState(false)

  // Add a slight delay before showing the message for a staggered animation effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "w-full transition-all duration-300 ease-out",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2"
      )}
    >
      {isUser ? (
        <div className="flex justify-end mb-4">
          <div className="bg-white/[0.03] rounded-2xl rounded-tr-sm py-2.5 px-3.5 max-w-[85%]">
            <p className="text-sm text-white/80 leading-relaxed">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mt-0.5">
              <SparklesIcon className="h-3 w-3 text-white" />
            </div>
            <div className="flex-1">
              {isLoading ? (
                <LoadingDots />
              ) : (
                <div className="prose prose-invert max-w-none">
                  <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center space-x-1.5 min-h-[20px]">
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_0ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_160ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_320ms_infinite] rounded-full bg-gradient-to-r from-accent to-accent/80"></div>
    </div>
  )
}
