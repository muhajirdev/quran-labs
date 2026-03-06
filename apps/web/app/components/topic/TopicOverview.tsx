import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import { Hash, BookOpen, Tag, Languages, Info } from "lucide-react";

interface TopicOverviewProps {
  topic: {
    topic_id: number;
    name: string;
    arabic_name?: string;
    description?: string;
    verses_count?: number;
    related_topics_count?: number;
  };
}

export function TopicOverview({ topic }: TopicOverviewProps) {
  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden">
      <div className="bg-white/[0.02] p-4 pb-3 border-b border-white/5">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            Topic Overview
          </h2>
          <Badge variant="outline" className="text-sm bg-accent/5 text-accent border-accent/20">
            <Hash className="h-3 w-3 mr-1" />
            ID: {topic.topic_id}
          </Badge>
        </div>
        {topic.arabic_name && (
          <div className="flex items-center gap-1.5 text-sm text-white/50 mt-1 pl-3.5">
            <Languages className="h-3.5 w-3.5" />
            Arabic: <span className="font-arabic text-base text-white/90" dir="rtl" lang="ar">{topic.arabic_name}</span>
          </div>
        )}
      </div>
      <div className="p-4 pt-6">
        {topic.description ? (
          <div className="prose dark:prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white marker:text-accent">
            <p>{topic.description}</p>
          </div>
        ) : (
          <p className="text-white/40 italic flex items-center gap-2">
            <Info className="h-4 w-4" />
            No description available for this topic.
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          {topic.verses_count !== undefined && (
            <div className="bg-white/[0.02] border border-white/5 rounded-md px-3 py-2 flex items-center gap-3 hover:bg-white/[0.04] transition-colors">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{topic.verses_count}</p>
                <p className="text-xs text-white/50">Verses</p>
              </div>
            </div>
          )}

          {topic.related_topics_count !== undefined && (
            <div className="bg-white/[0.02] border border-white/5 rounded-md px-3 py-2 flex items-center gap-3 hover:bg-white/[0.04] transition-colors">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{topic.related_topics_count}</p>
                <p className="text-xs text-white/50">Related Topics</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white/[0.01] border-t border-white/5 py-3 px-4 flex justify-between">
        <div className="flex items-center text-xs text-white/40">
          <Info className="h-3.5 w-3.5 mr-1.5" />
          <span>Data from Quran Knowledge Graph</span>
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.05] hover:text-white hover:border-accent/40 transition-all shadow-sm">
          <BookOpen className="h-4 w-4 text-accent" />
          Explore in Graph
        </Button>
      </div>
    </div>
  );
}
