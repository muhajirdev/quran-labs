import React, { useState } from 'react';
import type { GraphNode } from './types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowRightIcon, ArrowLeftIcon, ArrowLeftRightIcon, PlusIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface RelationshipInfo {
  type: string;
  direction: 'incoming' | 'outgoing' | 'both';
  // For current relationships
  connectedNodes?: GraphNode[];
  // For schema relationships
  connectedNodeTypes?: string[];
  // Status
  status: 'current' | 'available' | 'both';
}

interface MergedRelationshipPanelProps {
  actualRelationships: {
    type: string;
    direction: 'incoming' | 'outgoing' | 'both';
    connectedNodes: GraphNode[]
  }[];
  schemaRelationships: {
    type: string;
    direction: 'incoming' | 'outgoing' | 'both';
    connectedNodeTypes: string[]
  }[];
  onExpandRelationship: (relType: string, direction: string) => void;
}

export function MergedRelationshipPanel({
  actualRelationships,
  schemaRelationships,
  onExpandRelationship
}: MergedRelationshipPanelProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Function to render the direction icon
  const renderDirectionIcon = (direction: 'incoming' | 'outgoing' | 'both', className = "h-4 w-4") => {
    switch (direction) {
      case 'incoming':
        return <ArrowLeftIcon className={className} />;
      case 'outgoing':
        return <ArrowRightIcon className={className} />;
      case 'both':
        return <ArrowLeftRightIcon className={className} />;
    }
  };

  // Merge relationships
  const mergeRelationships = (): RelationshipInfo[] => {
    const relationshipMap = new Map<string, RelationshipInfo>();

    // Add actual relationships
    actualRelationships.forEach(rel => {
      relationshipMap.set(rel.type, {
        type: rel.type,
        direction: rel.direction,
        connectedNodes: rel.connectedNodes,
        status: 'current'
      });
    });

    // Add or update with schema relationships
    schemaRelationships.forEach(rel => {
      if (relationshipMap.has(rel.type)) {
        // Update existing relationship
        const existing = relationshipMap.get(rel.type)!;
        relationshipMap.set(rel.type, {
          ...existing,
          connectedNodeTypes: rel.connectedNodeTypes,
          status: 'both'
        });
      } else {
        // Add new schema relationship
        relationshipMap.set(rel.type, {
          type: rel.type,
          direction: rel.direction,
          connectedNodeTypes: rel.connectedNodeTypes,
          status: 'available'
        });
      }
    });

    return Array.from(relationshipMap.values());
  };

  const mergedRelationships = mergeRelationships();
  const currentCount = mergedRelationships.filter(r => r.status === 'current' || r.status === 'both').length;
  const availableCount = mergedRelationships.filter(r => r.status === 'available' || r.status === 'both').length;

  console.log("MergedRelationshipPanel rendering with:", {
    mergedRelationships: mergedRelationships.length,
    current: currentCount,
    available: availableCount
  });

  // Filter relationships based on active tab
  const filteredRelationships = mergedRelationships.filter(rel => {
    if (activeTab === "all") return true;
    if (activeTab === "current") return rel.status === 'current' || rel.status === 'both';
    if (activeTab === "available") return rel.status === 'available' || rel.status === 'both';
    return true;
  });

  // Get status badge color
  const getStatusBadgeColor = (status: 'current' | 'available' | 'both') => {
    switch (status) {
      case 'current':
        return "bg-primary/10 text-primary border-primary/20";
      case 'available':
        return "bg-secondary/20 text-foreground border-secondary/30";
      case 'both':
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50";
    }
  };

  // Get status label
  const getStatusLabel = (status: 'current' | 'available' | 'both') => {
    switch (status) {
      case 'current':
        return "Current";
      case 'available':
        return "Available";
      case 'both':
        return "Current & Available";
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="all" className="text-xs">
            All <Badge className="ml-1 bg-secondary/20">{mergedRelationships.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="current" className="text-xs">
            Current <Badge className="ml-1 bg-primary/10 text-primary">{currentCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="available" className="text-xs">
            Available <Badge className="ml-1 bg-secondary/20">{availableCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="border border-sidebar-border rounded-md overflow-hidden divide-y divide-sidebar-border">
            {filteredRelationships.length > 0 ? (
              filteredRelationships.map((rel, index) => (
                <div key={`rel-${index}`} className="p-3 hover:bg-secondary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderDirectionIcon(rel.direction, "h-4 w-4 text-foreground")}
                      <span className="font-medium">{rel.type}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusBadgeColor(rel.status)}`}
                      >
                        {getStatusLabel(rel.status)}
                      </Badge>
                    </div>

                    {rel.connectedNodes && rel.connectedNodes.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                              {rel.connectedNodes.length}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Connected to {rel.connectedNodes.length} node(s)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  <Accordion type="single" collapsible className="mt-2">
                    <AccordionItem value="details" className="border-0">
                      <AccordionTrigger className="py-1 px-0 text-xs text-sidebar-foreground/70 hover:no-underline">
                        Details
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-0">
                        {/* Connected Nodes */}
                        {rel.connectedNodes && rel.connectedNodes.length > 0 && (
                          <div className="mb-3 text-xs">
                            <div className="text-sidebar-foreground/70 mb-1 font-medium">Connected to:</div>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1 pl-2">
                              {rel.connectedNodes.map((node, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: node.color || '#4B5563' }}
                                  ></div>
                                  <span className="truncate">{node.label}: {node.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Connected Node Types */}
                        {rel.connectedNodeTypes && rel.connectedNodeTypes.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-sidebar-foreground/70 mb-1 font-medium">Can connect to:</div>
                            <div className="flex flex-wrap gap-1 pl-2">
                              {rel.connectedNodeTypes.map((type, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-secondary/10 text-xs"
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expansion Controls */}
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center justify-center gap-1"
                            onClick={() => onExpandRelationship(rel.type, 'incoming')}
                          >
                            <ArrowLeftIcon className="h-3 w-3" />
                            <span>Incoming</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center justify-center gap-1"
                            onClick={() => onExpandRelationship(rel.type, 'outgoing')}
                          >
                            <ArrowRightIcon className="h-3 w-3" />
                            <span>Outgoing</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs flex items-center justify-center gap-1"
                            onClick={() => onExpandRelationship(rel.type, 'both')}
                          >
                            <ArrowLeftRightIcon className="h-3 w-3" />
                            <span>Both</span>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-sidebar-foreground/70 italic flex items-center justify-center gap-2">
                <InfoIcon className="h-4 w-4" />
                <span>No relationships found</span>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Expand All Button */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          className="w-full flex items-center justify-center gap-2"
          onClick={() => onExpandRelationship('ALL', 'both')}
        >
          <PlusIcon className="h-4 w-4" />
          <span>Expand All Relationships</span>
        </Button>
      </div>
    </div>
  );
}
