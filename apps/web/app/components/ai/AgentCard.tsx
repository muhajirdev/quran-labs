"use client"

import * as React from "react"
import {
  BookOpenIcon,
  MusicIcon,
  BookTextIcon,
  BotIcon,
  HeartIcon,
  NetworkIcon,
  PaletteIcon,
  GraduationCapIcon,
  FileTextIcon,
  LinkIcon,
  SearchIcon,
  ClockIcon,
  GitCompareIcon,
  LightbulbIcon,
  CalendarIcon,
  SparklesIcon
} from "lucide-react"
import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import type { AgentDefinition } from "~/agents/agent-types"

interface AgentCardProps {
  agent: AgentDefinition
  isSelected?: boolean
  onClick?: () => void
  compact?: boolean
}

// Map of icon names to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  "BookOpen": <BookOpenIcon className="h-full w-full" />,
  "Music": <MusicIcon className="h-full w-full" />,
  "BookText": <BookTextIcon className="h-full w-full" />,
  "Bot": <BotIcon className="h-full w-full" />,
  "Heart": <HeartIcon className="h-full w-full" />,
  "Network": <NetworkIcon className="h-full w-full" />,
  "Palette": <PaletteIcon className="h-full w-full" />,
  "GraduationCap": <GraduationCapIcon className="h-full w-full" />,
  "FileText": <FileTextIcon className="h-full w-full" />,
  "Link": <LinkIcon className="h-full w-full" />,
  "Search": <SearchIcon className="h-full w-full" />,
  "Clock": <ClockIcon className="h-full w-full" />,
  "GitCompare": <GitCompareIcon className="h-full w-full" />,
  "Lightbulb": <LightbulbIcon className="h-full w-full" />,
  "Calendar": <CalendarIcon className="h-full w-full" />
}

export function AgentCard({ agent, isSelected = false, onClick, compact = false }: AgentCardProps) {
  // Get the icon component
  const IconComponent = iconMap[agent.icon] || <BotIcon className="h-full w-full" />

  return (
    <div
      className={cn(
        "group relative rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        isSelected ? "ring-2 ring-accent" : "hover:border-white/20",
        onClick ? "cursor-pointer" : "",
        compact ? "p-3" : "p-4"
      )}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>

      {/* New badge */}
      {agent.isNew && (
        <Badge
          variant="outline"
          className="absolute top-2 right-2 bg-accent/10 text-accent border-accent/20 text-xs"
        >
          New
        </Badge>
      )}

      <div className="relative z-10 flex items-start gap-3">
        {/* Agent icon */}
        <div
          className={cn(
            "flex-shrink-0 rounded-md flex items-center justify-center",
            compact ? "w-8 h-8" : "w-10 h-10"
          )}
          style={{
            backgroundColor: agent.backgroundColor || "#1E293B",
            color: agent.iconColor || "#FFFFFF"
          }}
        >
          {IconComponent}
        </div>

        <div className="flex-1 min-w-0">
          {/* Agent name */}
          <h3 className={cn(
            "font-medium text-white group-hover:text-white/90 flex items-center gap-1.5",
            compact ? "text-sm" : "text-base"
          )}>
            {agent.name}
            {agent.isPopular && (
              <SparklesIcon className="h-3 w-3 text-yellow-400" />
            )}
          </h3>

          {/* Agent description */}
          <p className={cn(
            "text-white/60 group-hover:text-white/70 mt-0.5",
            compact ? "text-xs" : "text-sm"
          )}>
            {agent.description}
          </p>

          {/* Agent capabilities */}
          {!compact && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {agent.capabilities.slice(0, 3).map((capability) => (
                <Badge
                  key={capability.id}
                  variant="secondary"
                  className="bg-white/5 hover:bg-white/10 text-white/70 border-0 text-xs py-0 h-5"
                >
                  {capability.name}
                </Badge>
              ))}
              {agent.capabilities.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-white/5 hover:bg-white/10 text-white/70 border-0 text-xs py-0 h-5"
                >
                  +{agent.capabilities.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
