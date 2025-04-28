import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Link } from "react-router";
import { ChevronRight, ChevronDown, Tag, Network, ArrowUpRight } from "lucide-react";

interface TopicNode {
  topic_id: number;
  name: string;
}

interface TopicHierarchyProps {
  parent?: TopicNode;
  children?: TopicNode[];
  siblings?: TopicNode[];
  currentTopic: {
    topic_id: number;
    name: string;
  };
}

export function TopicHierarchy({ parent, children, siblings, currentTopic }: TopicHierarchyProps) {
  const [showSiblings, setShowSiblings] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "hierarchy" : ""}
        onValueChange={(value) => setIsOpen(value === "hierarchy")}
      >
        <AccordionItem value="hierarchy" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Network className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="font-medium">Topic Hierarchy</h3>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal ml-auto mr-4">
              {currentTopic.name}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 space-y-4 px-4">
            {/* Parent Topic */}
            {parent && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Parent Topic:
                </h3>
                <div className="pl-2 border-l-2 border-primary/20">
                  <Link to={`/topic/${parent.topic_id}`}>
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {parent.name}
                    </Badge>
                  </Link>
                </div>
              </div>
            )}

            {/* Current Topic */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Current Topic:
              </h3>
              <div className="pl-2 border-l-2 border-primary">
                <Badge
                  variant="default"
                  className="px-3 py-1.5"
                >
                  {currentTopic.name}
                </Badge>
              </div>
            </div>

            {/* Sibling Topics */}
            {siblings && siblings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Sibling Topics:
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setShowSiblings(!showSiblings)}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSiblings ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                {showSiblings && (
                  <div className="pl-2 border-l-2 border-primary/20 flex flex-wrap gap-1.5">
                    {siblings.map((sibling) => (
                      <Link key={sibling.topic_id} to={`/topic/${sibling.topic_id}`}>
                        <Badge
                          variant="outline"
                          className="px-2 py-1 hover:bg-muted/20 transition-colors cursor-pointer"
                        >
                          {sibling.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Child Topics */}
            {children && children.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <ChevronDown className="h-3.5 w-3.5" />
                  Child Topics:
                </h3>
                <div className="pl-2 border-l-2 border-primary/20 flex flex-wrap gap-1.5">
                  {children.map((child) => (
                    <Link key={child.topic_id} to={`/topic/${child.topic_id}`}>
                      <Badge
                        variant="secondary"
                        className="px-2 py-1 hover:bg-secondary/80 transition-colors cursor-pointer"
                      >
                        {child.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(!parent && (!children || children.length === 0) && (!siblings || siblings.length === 0)) && (
              <div className="py-2 text-center text-muted-foreground italic text-sm">
                No hierarchy information available for this topic
              </div>
            )}

            <div className="flex justify-center mt-6">
              <Button className="gap-1.5">
                <Network className="h-4 w-4" />
                View Topic Network
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
