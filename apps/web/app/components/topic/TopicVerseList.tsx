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
          <BookOpen className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-medium text-white">Verses Addressing {topicName}</h2>
          <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20">
            {verses.length}
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            RELEVANCE SCORES: DEMO DATA
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-white/40" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "relevance" | "order")}>
              <SelectTrigger className="h-8 w-[160px] bg-[#1c1c1c] border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1c1c] border-white/10 text-white">
                <SelectItem value="order" className="focus:bg-white/10 focus:text-white">Quranic Order</SelectItem>
                <SelectItem value="relevance" className="focus:bg-white/10 focus:text-white">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white/40" />
            <Select value={filterBy} onValueChange={setFilterBy as any}>
              <SelectTrigger className="h-8 w-[160px] bg-[#1c1c1c] border-white/10 text-white">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent className="bg-[#1c1c1c] border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Verses</SelectItem>
                <SelectItem value="meccan" className="focus:bg-white/10 focus:text-white">Meccan Verses</SelectItem>
                <SelectItem value="medinan" className="focus:bg-white/10 focus:text-white">Medinan Verses</SelectItem>
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
            className="gap-2 bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.05] hover:text-white hover:border-accent/40 transition-all shadow-sm"
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
    <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden hover:border-accent/30 transition-colors">
      <div className="bg-white/[0.02] p-3 border-b border-white/5">
        <div className="flex justify-between items-center">
          <Link to={`/verse/${verse.verse_key}`} className="hover:text-accent transition-colors group/link">
            <div className="text-base flex items-center gap-1.5 font-medium text-white">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 group-hover/link:bg-accent/20 transition-colors">
                {verse.verse_key}
              </Badge>
              {verse.surah_name && <span className="text-sm font-normal text-white/50 group-hover/link:text-white/70 transition-colors">Surah {verse.surah_name}</span>}
            </div>
          </Link>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full text-white/50 hover:text-white hover:bg-white/10" asChild>
                  <Link to={`/verse/${verse.verse_key}`}>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-[#1c1c1c] border-white/10 text-white">
                <p>View verse details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm leading-relaxed text-white/80">{verse.text}</p>
      </div>
      {verse.relevance !== undefined && (
        <div className="py-2.5 px-4 bg-white/[0.01] border-t border-white/5 flex justify-between">
          <div className="text-xs text-white/50">
            Relevance:
            <span className="ml-1.5 text-accent font-medium bg-accent/10 px-1.5 py-0.5 rounded-sm">
              {Math.round(verse.relevance * 100)}%
            </span>
          </div>

          {(verse.juz || verse.hizb || verse.ruku) && (
            <div className="flex items-center gap-2">
              {verse.juz && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/5 text-white/70 border-white/10">
                  Juz {verse.juz}
                </Badge>
              )}
              {verse.hizb && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/5 text-white/70 border-white/10">
                  Hizb {verse.hizb}
                </Badge>
              )}
              {verse.ruku && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/5 text-white/70 border-white/10">
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
