"use client"

import * as React from "react"
import { CommandGroup } from "~/components/ui/command"

interface CommandCategoryProps {
  title: string
  children: React.ReactNode
}

export function CommandCategory({ title, children }: CommandCategoryProps) {
  return (
    <CommandGroup heading={title} className="px-2 py-1">
      {children}
    </CommandGroup>
  )
}
