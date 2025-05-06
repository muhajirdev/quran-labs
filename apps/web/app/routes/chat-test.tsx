import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createChatCompletion } from "~/lib/openrouter";
import type { Message } from "~/lib/openrouter";
import type { Route } from "./+types/chat-test";
import { getSystemMessage } from "~/lib/system-prompt";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Chat Test | Quran Knowledge Graph" },
    { name: "description", content: "Test the OpenRouter chat integration" },
  ];
}

export default function ChatTest() {
  const [messages, setMessages] = useState<Message[]>([
    getSystemMessage(),
    {
      role: "assistant",
      content: "I'm your Quran AI Assistant. Ask me anything about the Quran, its verses, chapters, themes, or interpretations. I'll do my best to provide accurate, helpful information."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      role: "user",
      content: input.trim()
    };

    // Update messages with user message
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Add a placeholder message for the loading state
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      // Get AI response
      const response = await createChatCompletion({
        messages: [...messages, userMessage],
        temperature: 0.7,
        max_tokens: 500
      });

      // Replace the placeholder with the actual response
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        response.choices[0].message
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Replace the placeholder with an error message
      setMessages(prev => [
        ...prev.slice(0, prev.length - 1),
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat Test</h1>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 border rounded-lg p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${message.role === "user"
              ? "bg-primary/10 ml-auto"
              : message.role === "assistant"
                ? "bg-secondary/10"
                : "bg-muted/50 text-xs"
              } ${message.role !== "system" ? "max-w-[80%]" : "max-w-full text-muted-foreground"}`}
          >
            {message.content || (message.role === "assistant" && isLoading && index === messages.length - 1 ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-current rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            ) : null)}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
