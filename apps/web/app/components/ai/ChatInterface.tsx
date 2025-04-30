"use client"

import * as React from "react"
import { SendIcon } from "lucide-react"
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

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        <div className="space-y-4">
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
      <Separator />
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the Quran..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
