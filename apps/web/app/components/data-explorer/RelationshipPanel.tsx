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
import { ArrowRightIcon, ArrowLeftIcon, ArrowLeftRightIcon, PlusIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";

interface RelationshipPanelProps {
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

export function RelationshipPanel({
  actualRelationships,
  schemaRelationships,
  onExpandRelationship
}: RelationshipPanelProps) {
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

  console.log("RelationshipPanel rendering with:", {
    actualRelationships: actualRelationships.length,
    schemaRelationships: schemaRelationships.length
  });

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["current-relationships", "schema-relationships"]} className="space-y-2">
        {/* Current Relationships */}
        <AccordionItem value="current-relationships" className="border border-sidebar-border rounded-md overflow-hidden">
          <AccordionTrigger className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 hover:no-underline">
            <div className="flex items-center text-sm font-medium">
              <Badge variant="outline" className="mr-2 bg-primary/10 text-primary border-primary/20">
                {actualRelationships.length}
              </Badge>
              Current Relationships
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0">
            {actualRelationships && actualRelationships.length > 0 ? (
              <div className="divide-y divide-sidebar-border">
                {actualRelationships.map((rel, index) => (
                  <div key={`actual-${index}`} className="p-3 hover:bg-secondary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderDirectionIcon(rel.direction, "h-4 w-4 text-primary")}
                        <span className="font-medium">{rel.type}</span>
                      </div>
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
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center justify-center gap-1"
                        onClick={() => onExpandRelationship(rel.type, 'incoming')}
                        disabled={rel.direction === 'outgoing'}
                      >
                        <ArrowLeftIcon className="h-3 w-3" />
                        <span>Incoming</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center justify-center gap-1"
                        onClick={() => onExpandRelationship(rel.type, 'outgoing')}
                        disabled={rel.direction === 'incoming'}
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

                    {rel.connectedNodes.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className="text-sidebar-foreground/70 mb-1">Connected to:</div>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-sm text-sidebar-foreground/70 italic">
                No connections in current graph view.
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Schema Relationships */}
        {schemaRelationships && schemaRelationships.length > 0 && (
          <AccordionItem value="schema-relationships" className="border border-sidebar-border rounded-md overflow-hidden">
            <AccordionTrigger className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 hover:no-underline">
              <div className="flex items-center text-sm font-medium">
                <Badge variant="outline" className="mr-2 bg-secondary/20 text-foreground border-secondary/30">
                  {schemaRelationships.length}
                </Badge>
                Available in Schema
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0">
              <div className="divide-y divide-sidebar-border">
                {schemaRelationships.map((rel, index) => (
                  <div key={`schema-${index}`} className="p-3 hover:bg-secondary/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderDirectionIcon(rel.direction, "h-4 w-4 text-secondary-foreground")}
                        <span className="font-medium">{rel.type}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs flex items-center gap-1"
                        onClick={() => onExpandRelationship(rel.type, rel.direction)}
                      >
                        <PlusIcon className="h-3 w-3" />
                        <span>Expand</span>
                      </Button>
                    </div>

                    {rel.connectedNodeTypes.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-sidebar-foreground/70 mb-1">Can connect to:</div>
                        <div className="flex flex-wrap gap-1">
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
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

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
