"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { BotIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "~/components/ui/avatar"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant" | "system"
    content: string
  }
  isLoading?: boolean
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user"
  
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "bg-muted/50" : "bg-background"
      )}
    >
      <Avatar className={cn("h-8 w-8", isUser ? "bg-primary" : "bg-accent")}>
        <AvatarFallback>
          {isUser ? <UserIcon className="h-4 w-4" /> : <BotIcon className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium">
          {isUser ? "You" : "Quran AI Assistant"}
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoading && message.role === "assistant" ? (
            <LoadingDots />
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground animation-delay-200"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground animation-delay-400"></div>
    </div>
  )
}
