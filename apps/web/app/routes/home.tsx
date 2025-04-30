import type { Route } from "./+types/home";
import {
  BookOpenIcon,
  SearchIcon,
  NetworkIcon as GraphIcon,
  BookIcon,
  LayersIcon,
  BookMarkedIcon,
  NetworkIcon,
  LayoutGridIcon,
  BrainCircuit
} from "lucide-react";
import { CommandBar } from "~/components/command/CommandBar";
import { CommandCategory } from "~/components/command/CommandCategory";
import { CommandItem } from "~/components/command/CommandItem";

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
        </div>

        <CommandBar placeholder="Search the Quran Knowledge Graph...">
          <CommandCategory title="Explore">
            <CommandItem
              icon={<SearchIcon className="h-4 w-4" />}
              title="Search"
              shortcut="⌘ S"
              href="/search"
            />
            <CommandItem
              icon={<GraphIcon className="h-4 w-4" />}
              title="Graph Explorer"
              shortcut="⌘ G"
              href="/data-explorer"
            />
            <CommandItem
              icon={<LayoutGridIcon className="h-4 w-4" />}
              title="Topic Explorer"
              shortcut="⌘ T"
              href="/topic"
            />
          </CommandCategory>

          <CommandCategory title="Content">
            <CommandItem
              icon={<BookIcon className="h-4 w-4" />}
              title="Browse Verses"
              shortcut="⌘ V"
              href="/verse"
            />
            <CommandItem
              icon={<LayersIcon className="h-4 w-4" />}
              title="Explore Translations"
              shortcut="⌘ E"
              href="/translations"
            />
            <CommandItem
              icon={<BookMarkedIcon className="h-4 w-4" />}
              title="Explore Tafsir"
              shortcut="⌘ I"
              href="/tafsir"
            />
          </CommandCategory>

          <CommandCategory title="Advanced">
            <CommandItem
              icon={<NetworkIcon className="h-4 w-4" />}
              title="Schema Viewer"
              shortcut="⌘ M"
              href="/schema"
            />
            <CommandItem
              icon={<BrainCircuit className="h-4 w-4" />}
              title="AI Assistant"
              shortcut="⌘ A"
              href="/ai-assistant"
            />
          </CommandCategory>
        </CommandBar>

        <div className="text-center text-xs text-muted-foreground">
          <p>{loaderData.message}</p>
          <p className="mt-2">Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘ K</kbd> anywhere to open this command palette</p>
        </div>
      </div>
    </div>
  );
}
