"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { BotIcon, UserIcon, SparklesIcon } from "lucide-react"

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
        "w-full transition-all duration-500 ease-in-out",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
      )}
    >
      {isUser ? (
        <div className="flex justify-end mb-4">
          <div className="bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-lg py-3 px-4 max-w-[85%]">
            <p className="text-base text-white/90 leading-relaxed">{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center">
              <SparklesIcon className="h-3 w-3 text-accent" />
            </div>
            <div className="flex-1 ">
              {isLoading ? (
                <LoadingDots />
              ) : (
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">{message.content}</p>
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
    <div className="flex items-center space-x-1.5 min-h-[25px]">
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_0ms_infinite] rounded-full bg-accent/70"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_160ms_infinite] rounded-full bg-accent/70"></div>
      <div className="h-1.5 w-1.5 animate-[pulse_1.2s_ease-in-out_320ms_infinite] rounded-full bg-accent/70"></div>
    </div>
  )
}
