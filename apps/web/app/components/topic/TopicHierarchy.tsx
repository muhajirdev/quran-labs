import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  const [showSiblings, setShowSiblings] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/10 py-3">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Topic Hierarchy</CardTitle>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            DEMO DATA
          </Badge>
        </div>
        <CardDescription>
          Explore how this topic relates to others
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2 space-y-4">
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
      </CardContent>
      <CardFooter className="bg-muted/5 border-t border-border/30 py-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1.5 ml-auto">
                <Network className="h-3.5 w-3.5" />
                View Topic Network
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Explore the full topic network in the graph explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
