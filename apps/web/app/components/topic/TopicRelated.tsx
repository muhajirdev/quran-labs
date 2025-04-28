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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Link } from "react-router";
import { Tag, Network, Info, ExternalLink } from "lucide-react";

interface RelatedTopic {
  topic_id: number;
  name: string;
  description?: string;
  relevance?: number;
  verses_count?: number;
}

interface TopicRelatedProps {
  topics: RelatedTopic[];
  currentTopicName: string;
}

export function TopicRelated({ topics, currentTopicName }: TopicRelatedProps) {
  const [expanded, setExpanded] = useState(false);

  // Group topics by relevance
  const highRelevance = topics.filter(t => t.relevance && t.relevance > 0.7);
  const mediumRelevance = topics.filter(t => t.relevance && t.relevance > 0.4 && t.relevance <= 0.7);
  const lowRelevance = topics.filter(t => t.relevance && t.relevance <= 0.4);

  // If no relevance data, just show all topics
  const hasRelevanceData = topics.some(t => t.relevance !== undefined);

  // Determine which topics to display based on expanded state
  const displayTopics = expanded ? topics : topics.slice(0, 8);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/10 py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Related Topics</CardTitle>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            DEMO DATA
          </Badge>
        </div>
        <CardDescription>
          Topics related to {currentTopicName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        {hasRelevanceData ? (
          <div className="space-y-4">
            {highRelevance.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  Strong Relationship
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {highRelevance.map((topic) => (
                    <TopicBadge key={topic.topic_id} topic={topic} />
                  ))}
                </div>
              </div>
            )}

            {mediumRelevance.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/60"></span>
                  Moderate Relationship
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {mediumRelevance.map((topic) => (
                    <TopicBadge key={topic.topic_id} topic={topic} />
                  ))}
                </div>
              </div>
            )}

            {lowRelevance.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary/30"></span>
                  Weak Relationship
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {lowRelevance.map((topic) => (
                    <TopicBadge key={topic.topic_id} topic={topic} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {displayTopics.map((topic) => (
              <TopicBadge key={topic.topic_id} topic={topic} />
            ))}
          </div>
        )}

        {topics.length > 8 && !expanded && !hasRelevanceData && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-3 text-xs h-7 w-full"
          >
            Show {topics.length - 8} more topics
          </Button>
        )}
      </CardContent>
      <CardFooter className="bg-muted/5 border-t border-border/30 py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3 w-3 mr-1" />
          <span>Hover over topics to see details</span>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs h-7 gap-1.5 ml-auto">
                <ExternalLink className="h-3.5 w-3.5" />
                Explore All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Explore all related topics in the graph explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

interface TopicBadgeProps {
  topic: RelatedTopic;
}

function TopicBadge({ topic }: TopicBadgeProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={`/topic/${topic.topic_id}`}>
          <Badge
            variant="secondary"
            className="px-2.5 py-1 hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            {topic.name}
            {topic.relevance && (
              <span className="ml-1.5 text-[10px] bg-primary/10 text-primary rounded-sm px-1">
                {Math.round(topic.relevance * 100)}%
              </span>
            )}
          </Badge>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="flex justify-between space-y-1">
          <h4 className="font-medium">{topic.name}</h4>
        </div>
        <div className="space-y-2">
          {topic.description ? (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {topic.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No description available
            </p>
          )}
          {topic.verses_count && (
            <div className="flex items-center pt-2">
              <span className="bg-primary/10 text-primary text-xs rounded-sm px-1.5 py-0.5">
                {topic.verses_count} verses
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
