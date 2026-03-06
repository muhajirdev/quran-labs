import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

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
    <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
            <Tag className="h-3.5 w-3.5 text-accent" />
          </div>
          <h3 className="font-medium text-white flex items-center gap-2">
            Related Topics
          </h3>
        </div>
      </div>
      <div className="p-4 pt-5 pb-5">
        {hasRelevanceData ? (
          <div className="space-y-4">
            {highRelevance.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/50 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent"></span>
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
                <h3 className="text-sm font-medium text-white/50 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent/60"></span>
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
                <h3 className="text-sm font-medium text-white/50 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent/30"></span>
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
            className="mt-3 text-xs h-7 w-full text-white/50 hover:text-white hover:bg-white/10"
          >
            Show {topics.length - 8} more topics
          </Button>
        )}

        <div className="flex justify-between mt-6">
          <div className="flex items-center text-xs text-white/40">
            <Info className="h-3 w-3 mr-1" />
            <span>Hover over topics to see details</span>
          </div>

          <Button variant="outline" size="sm" className="text-xs h-7 gap-1.5 bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.05] hover:text-white hover:border-accent/40 shadow-sm transition-all group">
            <ExternalLink className="h-3.5 w-3.5 text-accent group-hover:scale-110 transition-transform" />
            Explore All Topics
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TopicBadgeProps {
  topic: RelatedTopic;
}

function TopicBadge({ topic }: TopicBadgeProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link to={`/topic/${topic.topic_id}`}>
          <Badge
            variant="outline"
            className="px-2.5 py-1 bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            {topic.name}
            {topic.relevance && (
              <span className="ml-1.5 text-[10px] bg-accent/20 text-accent rounded-sm px-1 font-medium">
                {Math.round(topic.relevance * 100)}%
              </span>
            )}
          </Badge>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 bg-[#1c1c1c] border-white/10 text-white shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between space-y-1">
          <h4 className="font-semibold text-white">{topic.name}</h4>
        </div>
        <div className="space-y-2 mt-2">
          {topic.description ? (
            <p className="text-sm text-white/70 line-clamp-3">
              {topic.description}
            </p>
          ) : (
            <p className="text-sm text-white/40 italic">
              No description available
            </p>
          )}
          {topic.verses_count && (
            <div className="flex items-center pt-2">
              <span className="bg-accent/10 text-accent text-xs rounded-sm px-1.5 py-0.5 border border-accent/20">
                {topic.verses_count} verses
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
