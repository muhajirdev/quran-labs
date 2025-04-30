"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "~/components/ui/command"
import { useNavigate } from "react-router"

interface CommandBarProps {
  placeholder?: string
  children: React.ReactNode
}

export function CommandBar({ placeholder = "Search for commands...", children }: CommandBarProps) {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState("")

  return (
    <Command className="rounded-lg border shadow-md">
      <div className="flex items-center border-b px-3 py-3">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
        <CommandInput
          value={search}
          onValueChange={setSearch}
          placeholder={placeholder}
          className="h-9 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
      <CommandList className="max-h-[80vh] overflow-auto py-2">
        <CommandEmpty>No results found.</CommandEmpty>
        {children}
      </CommandList>
    </Command>
  )
}
