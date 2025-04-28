import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Topic Overview</CardTitle>
          <Badge variant="outline" className="text-sm">
            <Hash className="h-3 w-3 mr-1" />
            ID: {topic.topic_id}
          </Badge>
        </div>
        {topic.arabic_name && (
          <CardDescription className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5" />
            Arabic: <span className="font-arabic text-base">{topic.arabic_name}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {topic.description ? (
          <div className="prose dark:prose-invert max-w-none">
            <p>{topic.description}</p>
          </div>
        ) : (
          <p className="text-muted-foreground italic">No description available for this topic.</p>
        )}
        
        <div className="flex flex-wrap gap-3 mt-6">
          {topic.verses_count !== undefined && (
            <div className="bg-muted/10 rounded-md px-3 py-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{topic.verses_count}</p>
                <p className="text-xs text-muted-foreground">Verses</p>
              </div>
            </div>
          )}
          
          {topic.related_topics_count !== undefined && (
            <div className="bg-muted/10 rounded-md px-3 py-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{topic.related_topics_count}</p>
                <p className="text-xs text-muted-foreground">Related Topics</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/5 border-t border-border/30 py-3 flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 mr-1.5" />
          <span>Data from Quran Knowledge Graph</span>
        </div>
        
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <BookOpen className="h-4 w-4" />
          Explore in Graph
        </Button>
      </CardFooter>
    </Card>
  );
}
