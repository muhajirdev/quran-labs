"use client"

import * as React from "react"
import { useNavigate } from "react-router"
import { CommandItem as ShadcnCommandItem, CommandShortcut } from "~/components/ui/command"

interface CommandItemProps {
  icon?: React.ReactNode
  title: string
  shortcut?: string
  href?: string
  onClick?: () => void
}

export function CommandItem({ icon, title, shortcut, href, onClick }: CommandItemProps) {
  const navigate = useNavigate()

  const handleSelect = () => {
    if (onClick) {
      onClick()
    } else if (href) {
      navigate(href)
    }
  }

  return (
    <ShadcnCommandItem
      onSelect={handleSelect}
      className="flex cursor-pointer items-center px-2 py-2 text-sm"
    >
      {icon && <div className="mr-2 flex h-6 w-6 items-center justify-center">{icon}</div>}
      <span>{title}</span>
      {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
    </ShadcnCommandItem>
  )
}
