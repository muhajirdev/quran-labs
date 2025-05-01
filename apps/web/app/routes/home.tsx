import type { Route } from "./+types/home";
import {
  BookOpenIcon,
  CommandIcon
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { HomeCommandDialog } from "~/components/command/HomeCommandDialog";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Knowledge Graph" },
    { name: "description", content: "Explore the Quran Knowledge Graph" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE || "Welcome to Quran Knowledge Graph" };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
            <BookOpenIcon className="h-8 w-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quran Knowledge Graph</h1>
          <p className="text-muted-foreground max-w-md">
            Explore the Quran through an interactive knowledge graph, discover connections, and gain deeper insights.
          </p>

          <Button
            variant="outline"
            size="lg"
            className="mt-4"
            onClick={() => setCommandDialogOpen(true)}
          >
            <CommandIcon className="mr-2 h-4 w-4" />
            <span>Open Command Palette</span>
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p className="mt-2">Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘ K</kbd> anywhere to open this command palette</p>
        </div>
      </div>

      <HomeCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
    </div>
  );
}
