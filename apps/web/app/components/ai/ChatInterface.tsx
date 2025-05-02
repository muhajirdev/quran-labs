"use client"

import * as React from "react"
import { SendIcon, SparklesIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ChatMessage } from "./ChatMessage"
import { createChatCompletion } from "~/lib/openrouter"
import { Separator } from "~/components/ui/separator"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    role: "system",
    content: "You are a helpful AI assistant specialized in the Quran and Islamic knowledge."
  },
  {
    role: "assistant",
    content: "I'm your Quran AI Assistant. Ask me anything about the Quran, its verses, chapters, themes, or interpretations."
  }
]

interface ChatInterfaceProps {
  initialQuery?: string;
}

export function ChatInterface({ initialQuery }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = React.useState(initialQuery || "")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const initialQueryProcessed = React.useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Process initial query if provided
  React.useEffect(() => {
    if (initialQuery && !initialQueryProcessed.current && !isLoading) {
      initialQueryProcessed.current = true;
      const submitInitialQuery = async () => {
        const userMessage: Message = {
          role: "user",
          content: initialQuery
        }

        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
          // Add a placeholder message for the loading state
          setMessages(prev => [...prev, { role: "assistant", content: "" }])

          const response = await createChatCompletion({
            messages: [...messages, userMessage],
            temperature: 0.7,
            max_tokens: 500
          })

          // Replace the placeholder with the actual response
          setMessages(prev => [
            ...prev.slice(0, prev.length - 1),
            response.choices[0].message
          ])
        } catch (error) {
          console.error("Error getting AI response:", error)
          // Replace the placeholder with an error message
          setMessages(prev => [
            ...prev.slice(0, prev.length - 1),
            { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
          ])
        } finally {
          setIsLoading(false)
        }
      }

      submitInitialQuery()
    }
  }, [initialQuery, messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Add a placeholder message for the loading state
      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      const response = await createChatCompletion({
        messages: [...messages, userMessage],
        temperature: 0.7,
        max_tokens: 500
      })

      // Replace the placeholder with the actual response
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        response.choices[0].message
      ])
    } catch (error) {
      console.error("Error getting AI response:", error)
      // Replace the placeholder with an error message
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.slice(1).map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isLoading={isLoading && index === messages.length - 2}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <Separator className="bg-border/50" />
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-muted-foreground">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the Quran..."
            className="pl-12 pr-12 py-6 text-lg shadow-md border-accent/20 focus-visible:ring-accent/30 flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 bg-accent hover:bg-accent/90"
            disabled={isLoading}
          >
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
