"use client"

import * as React from "react"
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
} from "lucide-react"

import {
  CommandDialog as ShadcnCommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "~/components/ui/command"
import { useNavigate } from "react-router"

export function CommandDialog() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <ShadcnCommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Explore">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/search"))}
          >
            <SearchIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Search</span>
            <CommandShortcut>⌘ S</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/data-explorer"))}
            className="group"
          >
            <GraphIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Graph Explorer</span>
            <CommandShortcut>⌘ G</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/topic"))}
            className="group"
          >
            <LayoutGridIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Topic Explorer</span>
            <CommandShortcut>⌘ T</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Content">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/verse"))}
            className="group"
          >
            <BookIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Browse Verses</span>
            <CommandShortcut>⌘ V</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/translations"))}
            className="group"
          >
            <LayersIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Explore Translations</span>
            <CommandShortcut>⌘ E</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/tafsir"))}
            className="group"
          >
            <BookMarkedIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Explore Tafsir</span>
            <CommandShortcut>⌘ I</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Advanced">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/schema"))}
            className="group"
          >
            <NetworkIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>Schema Viewer</span>
            <CommandShortcut>⌘ M</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => navigate("/ai-assistant"))}
            className="group"
          >
            <BrainCircuit className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />
            <span>AI Assistant</span>
            <CommandShortcut>⌘ A</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </ShadcnCommandDialog>
  )
}
