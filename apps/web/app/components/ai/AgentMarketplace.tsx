"use client"

import * as React from "react"
import { useState } from "react"
import {
  XIcon,
  SearchIcon,
  SparklesIcon,
  ArrowRightIcon
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  AGENT_CATEGORIES,
  AGENT_REGISTRY,
  getAgentById,
  getAgentsByCategory,
  getAvailableAgents,
  getNewAgents,
  getPopularAgents
} from "~/agents/agent-registry"
import { AgentCard } from "./AgentCard"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import type { AgentDefinition } from "~/agents/agent-types"

interface AgentMarketplaceProps {
  open: boolean
  onClose: () => void
  onSelectAgent: (agentId: string) => void
  selectedAgentId: string
}

export function AgentMarketplace({
  open,
  onClose,
  onSelectAgent,
  selectedAgentId
}: AgentMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Filter agents based on search query
  const filterAgents = (agents: AgentDefinition[]) => {
    if (!searchQuery) return agents

    const query = searchQuery.toLowerCase()
    return agents.filter(agent =>
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.capabilities.some(cap => cap.name.toLowerCase().includes(query))
    )
  }

  // Get agents based on active tab
  const getAgentsForTab = () => {
    switch (activeTab) {
      case "new":
        return filterAgents(getNewAgents())
      case "popular":
        return filterAgents(getPopularAgents())
      case "all":
        return filterAgents(getAvailableAgents())
      default:
        // If tab is a category ID
        if (AGENT_CATEGORIES.some(cat => cat.id === activeTab)) {
          return filterAgents(getAgentsByCategory(activeTab))
        }
        return filterAgents(getAvailableAgents())
    }
  }

  // Get the currently selected agent
  const selectedAgent = getAgentById(selectedAgentId)

  // Get filtered agents for the current tab
  const filteredAgents = getAgentsForTab()

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg bg-[#0A0A0A] border-l border-white/10 p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
            <h2 className="text-white font-medium flex items-center gap-2">
              <div className="bg-accent/10 rounded-full p-1.5">
                <SparklesIcon className="h-4 w-4 text-accent" />
              </div>
              <span className="text-base">Agent Marketplace</span>
            </h2>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white"
              onClick={onClose}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Tabs and Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-4 pt-4">
                <TabsList className="bg-white/5 p-1">
                  <TabsTrigger
                    value="all"
                    className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="new"
                    className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    New
                  </TabsTrigger>
                  <TabsTrigger
                    value="popular"
                    className="text-xs data-[state=active]:bg-white/10 data-[state=active]:text-white"
                  >
                    Popular
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Category Pills */}
              <div className="px-4 pt-3 pb-2 overflow-x-auto flex gap-2 scrollbar-hide">
                {AGENT_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-xs h-7 px-3 rounded-full border-white/10 bg-transparent hover:bg-white/5",
                      activeTab === category.id ? "bg-white/10 text-white" : "text-white/60"
                    )}
                    onClick={() => setActiveTab(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Agent List */}
              <TabsContent
                value={activeTab}
                className="flex-1 overflow-y-auto px-4 py-3 data-[state=active]:mt-0"
                forceMount
              >
                {filteredAgents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {filteredAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        isSelected={agent.id === selectedAgentId}
                        onClick={() => onSelectAgent(agent.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <SearchIcon className="h-8 w-8 text-white/20 mb-2" />
                    <p className="text-white/50 text-sm">No agents found matching your search.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Selected Agent Info */}
          {selectedAgent && (
            <div className="border-t border-white/10 p-4 bg-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: selectedAgent.backgroundColor || "#1E293B",
                      color: selectedAgent.iconColor || "#FFFFFF"
                    }}
                  >
                    {React.cloneElement(AgentCard({ agent: selectedAgent }).props.children[2].props.children[0].props.children as React.ReactElement, {
                      className: "h-4 w-4"
                    })}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{selectedAgent.name}</h4>
                    <p className="text-xs text-white/60">Currently selected</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-white/70 hover:text-white"
                  onClick={onClose}
                >
                  Close
                  <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
