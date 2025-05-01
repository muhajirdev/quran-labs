import { ChatInterface } from "~/components/ai/ChatInterface";
import { Button } from "~/components/ui/button";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/ai-assistant";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "AI Assistant - Quran Knowledge Graph" },
    { name: "description", content: "Ask questions about the Quran and get AI-powered answers" },
  ];
}

export default function AIAssistant() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-bold">Quran AI Assistant</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              <span className="rounded-full bg-accent/10 px-2 py-1 text-accent">
                Experimental
              </span>
            </div>
          </div>
        </div>
      </header>
      <main className="container flex-1 overflow-hidden py-4">
        <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <ChatInterface />
        </div>
      </main>
      <footer className="border-t py-2 text-center text-xs text-muted-foreground">
        <div className="container">
          <p>
            This is a demo using simulated responses. In a production environment, this would connect to OpenRouter API.
          </p>
        </div>
      </footer>
    </div>
  );
}
