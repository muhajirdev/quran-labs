import React from 'react';
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

  // Use all relationships
  const filteredRelationships = mergedRelationships;



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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Relationships:</h3>
        <div className="flex gap-2">
          {currentCount > 0 && (
            <Badge variant="default" className="text-xs">
              {currentCount} Current
            </Badge>
          )}
          {availableCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {availableCount} Available
            </Badge>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border bg-card shadow-sm">
        {filteredRelationships.length > 0 ? (
          filteredRelationships.map((rel, index) => (
            <div key={`rel-${index}`} className="p-3 hover:bg-muted/5 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderDirectionIcon(rel.direction, "h-4 w-4 text-primary")}
                  <span className="font-medium text-sm">{rel.type}</span>
                  <Badge
                    variant={rel.status === 'current' ? 'default' : (rel.status === 'both' ? 'outline' : 'secondary')}
                    className="text-xs"
                  >
                    {getStatusLabel(rel.status)}
                  </Badge>
                </div>

                {rel.connectedNodes && rel.connectedNodes.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="default" className="hover:bg-primary/80">
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
                  <AccordionTrigger className="py-1 px-0 text-xs text-muted-foreground hover:text-foreground hover:no-underline">
                    Details
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    {/* Connected Nodes */}
                    {rel.connectedNodes && rel.connectedNodes.length > 0 && (
                      <div className="mb-3 text-xs">
                        <div className="text-muted-foreground mb-1 font-medium">Connected to:</div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1 pl-2 rounded-md bg-muted/30 p-2">
                          {rel.connectedNodes.map((node, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
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
                        <div className="text-xs text-muted-foreground mb-1 font-medium">Can connect to:</div>
                        <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md">
                          {rel.connectedNodeTypes.map((type, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expansion Controls */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center justify-center gap-1 bg-background hover:bg-muted"
                        onClick={() => onExpandRelationship(rel.type, 'incoming')}
                      >
                        <ArrowLeftIcon className="h-3 w-3 text-primary" />
                        <span>Incoming</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center justify-center gap-1 bg-background hover:bg-muted"
                        onClick={() => onExpandRelationship(rel.type, 'outgoing')}
                      >
                        <ArrowRightIcon className="h-3 w-3 text-primary" />
                        <span>Outgoing</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center justify-center gap-1 bg-background hover:bg-muted"
                        onClick={() => onExpandRelationship(rel.type, 'both')}
                      >
                        <ArrowLeftRightIcon className="h-3 w-3 text-primary" />
                        <span>Both</span>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm text-muted-foreground flex items-center justify-center gap-2 bg-muted/20">
            <InfoIcon className="h-4 w-4 text-primary/70" />
            <span>No relationships found</span>
          </div>
        )}
      </div>

      {/* Expand All Button */}
      <div className="flex justify-center mt-2" >
        <Button
          variant="default"
          size="sm"
          className="w-full flex items-center justify-center gap-2 shadow-sm"
          onClick={() => onExpandRelationship('ALL', 'both')}
        >
          <PlusIcon className="h-4 w-4" />
          <span>Expand All Relationships</span>
        </Button>
      </div>
    </div >
  );
}
