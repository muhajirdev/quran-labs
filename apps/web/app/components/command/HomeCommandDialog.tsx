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
  BrainCircuit,
  HistoryIcon
} from "lucide-react"

import {
  CommandDialog as ShadcnCommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
} from "~/components/ui/command"
import { useNavigate } from "react-router"
import { HighlightMatch } from "./HighlightMatch"

// Define command types for better structure
type CommandType = {
  id: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
  category: 'explore' | 'content' | 'advanced' | 'recent';
};

interface HomeCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HomeCommandDialog({ open, onOpenChange }: HomeCommandDialogProps) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState("")
  const [recentCommands, setRecentCommands] = React.useState<string[]>([])

  // Load recent commands from localStorage on component mount
  React.useEffect(() => {
    const storedRecents = localStorage.getItem('recentCommands')
    if (storedRecents) {
      try {
        setRecentCommands(JSON.parse(storedRecents))
      } catch (e) {
        console.error('Failed to parse recent commands', e)
      }
    }
  }, [])

  // Save a command to recent history
  const addToRecents = React.useCallback((commandId: string) => {
    setRecentCommands(prev => {
      // Remove if exists and add to front (most recent)
      const newRecents = [commandId, ...prev.filter(id => id !== commandId)].slice(0, 5)
      localStorage.setItem('recentCommands', JSON.stringify(newRecents))
      return newRecents
    })
  }, [])

  const runCommand = React.useCallback((command: CommandType) => {
    onOpenChange(false)
    addToRecents(command.id)
    command.action()
  }, [onOpenChange, addToRecents])

  // Define all available commands
  const commands = React.useMemo<CommandType[]>(() => [
    {
      id: 'search',
      name: 'Search',
      shortcut: '⌘ S',
      icon: <SearchIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['search', 'find', 'lookup', 'query'],
      action: () => navigate('/search'),
      category: 'explore'
    },
    {
      id: 'graph-explorer',
      name: 'Graph Explorer',
      shortcut: '⌘ G',
      icon: <GraphIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['graph', 'network', 'explore', 'connections', 'visualization'],
      action: () => navigate('/data-explorer'),
      category: 'explore'
    },
    {
      id: 'topic-explorer',
      name: 'Topic Explorer',
      shortcut: '⌘ T',
      icon: <LayoutGridIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['topic', 'subject', 'theme', 'category'],
      action: () => navigate('/topic'),
      category: 'explore'
    },
    {
      id: 'browse-verses',
      name: 'Browse Verses',
      shortcut: '⌘ V',
      icon: <BookIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['verse', 'ayah', 'quran', 'browse', 'read'],
      action: () => navigate('/verse'),
      category: 'content'
    },
    {
      id: 'explore-translations',
      name: 'Explore Translations',
      shortcut: '⌘ E',
      icon: <LayersIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['translation', 'language', 'interpret'],
      action: () => navigate('/translations'),
      category: 'content'
    },
    {
      id: 'explore-tafsir',
      name: 'Explore Tafsir',
      shortcut: '⌘ I',
      icon: <BookMarkedIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['tafsir', 'interpretation', 'explanation', 'commentary'],
      action: () => navigate('/tafsir'),
      category: 'content'
    },
    {
      id: 'schema-viewer',
      name: 'Schema Viewer',
      shortcut: '⌘ M',
      icon: <NetworkIcon className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['schema', 'structure', 'database', 'model'],
      action: () => navigate('/schema'),
      category: 'advanced'
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      shortcut: '⌘ A',
      icon: <BrainCircuit className="mr-2 h-4 w-4 group-data-[selected=true]:text-accent-foreground" />,
      keywords: ['ai', 'assistant', 'help', 'intelligence', 'chat'],
      action: () => navigate('/?ai=true'),
      category: 'advanced'
    },
  ], [navigate])

  // Filter commands based on search input
  const filteredCommands = React.useMemo(() => {
    if (!search.trim()) return commands

    const searchLower = search.toLowerCase()
    return commands.filter(command =>
      command.name.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
    )
  }, [commands, search])

  // Get recent commands
  const recents = React.useMemo(() => {
    if (recentCommands.length === 0) return []
    return recentCommands
      .map(id => commands.find(cmd => cmd.id === id))
      .filter(Boolean) as CommandType[]
  }, [commands, recentCommands])

  // Group commands by category
  const exploreCommands = filteredCommands.filter(cmd => cmd.category === 'explore')
  const contentCommands = filteredCommands.filter(cmd => cmd.category === 'content')
  const advancedCommands = filteredCommands.filter(cmd => cmd.category === 'advanced')

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    // Additional keyboard handling can be added here
    if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }, [onOpenChange])

  // Reset search when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      // Small delay to avoid flickering during close animation
      setTimeout(() => setSearch(""), 150)
    }
  }, [open])

  return (
    <ShadcnCommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search the Quran Knowledge Graph..."
        value={search}
        onValueChange={setSearch}
        onKeyDown={handleKeyDown}
      />
      <CommandList>
        <CommandEmpty>No results found. Try a different search term.</CommandEmpty>

        {!search && recents.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recents.map(command => (
                <CommandItem
                  key={command.id}
                  onSelect={() => runCommand(command)}
                  className="group"
                >
                  <div className="mr-2 flex h-4 w-4 items-center justify-center">
                    <HistoryIcon className="h-3 w-3 group-data-[selected=true]:text-accent-foreground" />
                  </div>
                  <HighlightMatch text={command.name} query={search} />
                  {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {exploreCommands.length > 0 && (
          <CommandGroup heading="Explore">
            {exploreCommands.map(command => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command)}
                className="group"
              >
                {command.icon}
                <HighlightMatch text={command.name} query={search} />
                {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {contentCommands.length > 0 && (
          <CommandGroup heading="Content">
            {contentCommands.map(command => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command)}
                className="group"
              >
                {command.icon}
                <HighlightMatch text={command.name} query={search} />
                {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {advancedCommands.length > 0 && (
          <CommandGroup heading="Advanced">
            {advancedCommands.map(command => (
              <CommandItem
                key={command.id}
                onSelect={() => runCommand(command)}
                className="group"
              >
                {command.icon}
                <HighlightMatch text={command.name} query={search} />
                {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </ShadcnCommandDialog>
  )
}
