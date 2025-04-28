import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Link } from "react-router";
import { Tag, Info, ExternalLink } from "lucide-react";

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
  const [expanded, setExpanded] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  // Group topics by relevance
  const highRelevance = topics.filter(t => t.relevance && t.relevance > 0.7);
  const mediumRelevance = topics.filter(t => t.relevance && t.relevance > 0.4 && t.relevance <= 0.7);
  const lowRelevance = topics.filter(t => t.relevance && t.relevance <= 0.4);

  // If no relevance data, just show all topics
  const hasRelevanceData = topics.some(t => t.relevance !== undefined);

  // Determine which topics to display based on expanded state
  const displayTopics = expanded ? topics : topics.slice(0, 8);

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "related" : ""}
        onValueChange={(value) => setIsOpen(value === "related")}
      >
        <AccordionItem value="related" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="font-medium">Related Topics</h3>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal ml-auto mr-4">
              {currentTopicName}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-2 px-4">
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

            <div className="flex justify-between mt-6">
              <div className="flex items-center text-xs text-muted-foreground">
                <Info className="h-3 w-3 mr-1" />
                <span>Hover over topics to see details</span>
              </div>

              <Button variant="default" size="sm" className="text-xs h-7 gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Explore All Topics
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
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
