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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Link } from "react-router";
import { BookOpen, ChevronRight, Filter, SlidersHorizontal } from "lucide-react";

interface Verse {
  verse_key: string;
  text: string;
  surah_name?: string;
  relevance?: number;
  juz?: number;
  hizb?: number;
  ruku?: number;
}

interface TopicVerseListProps {
  verses: Verse[];
  topicId: string | number;
  topicName: string;
}

export function TopicVerseList({ verses, topicId, topicName }: TopicVerseListProps) {
  const [sortBy, setSortBy] = useState<"relevance" | "order">("order");
  const [filterBy, setFilterBy] = useState<"all" | "meccan" | "medinan">("all");
  const [expanded, setExpanded] = useState<boolean>(false);

  // Sort verses based on the selected criteria
  const sortedVerses = [...verses].sort((a, b) => {
    if (sortBy === "relevance" && a.relevance !== undefined && b.relevance !== undefined) {
      return b.relevance - a.relevance;
    } else {
      // Sort by verse order (default)
      const [aSurah, aVerse] = a.verse_key.split(':').map(Number);
      const [bSurah, bVerse] = b.verse_key.split(':').map(Number);

      if (aSurah !== bSurah) {
        return aSurah - bSurah;
      }
      return aVerse - bVerse;
    }
  });

  // Display verses based on expanded state
  const displayVerses = expanded ? sortedVerses : sortedVerses.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Verses Addressing {topicName}</h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {verses.length}
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            RELEVANCE SCORES: DEMO DATA
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "relevance" | "order")}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Quranic Order</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterBy} onValueChange={setFilterBy as any}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verses</SelectItem>
                <SelectItem value="meccan">Meccan Verses</SelectItem>
                <SelectItem value="medinan">Medinan Verses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayVerses.map((verse) => (
          <VerseCard key={verse.verse_key} verse={verse} />
        ))}
      </div>

      {verses.length > 5 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            {expanded ? "Show Less" : `Show All ${verses.length} Verses`}
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      )}
    </div>
  );
}

interface VerseCardProps {
  verse: Verse;
}

function VerseCard({ verse }: VerseCardProps) {
  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden hover:border-primary/30 transition-colors">
      <div className="bg-muted/10 p-3">
        <div className="flex justify-between items-center">
          <Link to={`/verse/${verse.verse_key}`} className="hover:text-primary transition-colors">
            <div className="text-base flex items-center gap-1.5 font-medium">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {verse.verse_key}
              </Badge>
              {verse.surah_name && <span className="text-sm font-normal text-muted-foreground">Surah {verse.surah_name}</span>}
            </div>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full" asChild>
                  <Link to={`/verse/${verse.verse_key}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>View verse details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm leading-relaxed">{verse.text}</p>
      </div>
      {verse.relevance !== undefined && (
        <div className="py-2 px-3 bg-muted/5 border-t border-border/30 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Relevance:
            <span className="ml-1 text-primary font-medium">
              {Math.round(verse.relevance * 100)}%
            </span>
          </div>

          {(verse.juz || verse.hizb || verse.ruku) && (
            <div className="flex items-center gap-2">
              {verse.juz && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                  Juz {verse.juz}
                </Badge>
              )}
              {verse.hizb && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                  Hizb {verse.hizb}
                </Badge>
              )}
              {verse.ruku && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                  Ruku {verse.ruku}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
