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
  type?: "regular" | "thematic" | "ontology";
}

interface TopicRelation {
  topic: TopicNode;
  type: "regular" | "thematic" | "ontology";
}

// Props can accept either format
interface TopicHierarchyProps {
  parent?: TopicNode | TopicRelation;
  children?: (TopicNode | TopicRelation)[];
  siblings?: (TopicNode | TopicRelation)[];
  currentTopic: {
    topic_id: number;
    name: string;
  };
}

export function TopicHierarchy({ parent, children, siblings, currentTopic }: TopicHierarchyProps) {
  const [showSiblings, setShowSiblings] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  // Helper function to check if an object is a TopicRelation
  const isTopicRelation = (obj: any): obj is TopicRelation => {
    return obj && 'topic' in obj && 'type' in obj;
  };

  // Helper function to get the topic_id regardless of format
  const getTopicId = (obj: TopicNode | TopicRelation): number => {
    return isTopicRelation(obj) ? obj.topic.topic_id : obj.topic_id;
  };

  // Helper function to get the name regardless of format
  const getTopicName = (obj: TopicNode | TopicRelation): string => {
    return isTopicRelation(obj) ? obj.topic.name : obj.name;
  };

  // Helper function to get the type regardless of format
  const getTopicType = (obj: TopicNode | TopicRelation): "regular" | "thematic" | "ontology" => {
    return isTopicRelation(obj) ? obj.type : (obj.type || "regular");
  };

  // Helper function to get badge styling based on relation type
  const getRelationStyles = (type: "regular" | "thematic" | "ontology") => {
    switch (type) {
      case "thematic":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20";
      case "ontology":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20";
      default:
        return "hover:bg-muted/20";
    }
  };

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
                  <Link to={`/topic/${getTopicId(parent)}`}>
                    <Badge
                      variant="outline"
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${getRelationStyles(getTopicType(parent))}`}
                    >
                      {getTopicType(parent) !== "regular" && (
                        <span className="mr-1.5 text-[10px] uppercase font-medium">
                          {getTopicType(parent)}:
                        </span>
                      )}
                      {getTopicName(parent)}
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
                      <Link key={getTopicId(sibling)} to={`/topic/${getTopicId(sibling)}`}>
                        <Badge
                          variant="outline"
                          className={`px-2 py-1 transition-colors cursor-pointer ${getRelationStyles(getTopicType(sibling))}`}
                        >
                          {getTopicType(sibling) !== "regular" && (
                            <span className="mr-1 text-[10px] uppercase font-medium">
                              {getTopicType(sibling).charAt(0)}:
                            </span>
                          )}
                          {getTopicName(sibling)}
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
                    <Link key={getTopicId(child)} to={`/topic/${getTopicId(child)}`}>
                      <Badge
                        variant={getTopicType(child) === "regular" ? "secondary" : "outline"}
                        className={`px-2 py-1 transition-colors cursor-pointer ${getTopicType(child) === "regular" ? "hover:bg-secondary/80" : getRelationStyles(getTopicType(child))
                          }`}
                      >
                        {getTopicType(child) !== "regular" && (
                          <span className="mr-1 text-[10px] uppercase font-medium">
                            {getTopicType(child).charAt(0)}:
                          </span>
                        )}
                        {getTopicName(child)}
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
