import React from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "~/components/ui/card";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface ChapterInfoProps {
  chapterNumber: number;
  nameEnglish: string;
  nameArabic: string;
  revelationPlace: string;
  versesCount: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ChapterInfo({
  chapterNumber,
  nameEnglish,
  nameArabic,
  revelationPlace,
  versesCount,
  onPrevious,
  onNext
}: ChapterInfoProps) {
  return (
    <div className="rounded-lg overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.06]">
      <div className="px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-white">{chapterNumber}. {nameEnglish}</span>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors">
                {versesCount} verses
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex cursor-help">
                      <Info className="h-4 w-4 text-white/50 hover:text-white transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#121212] border-white/10 text-white">
                    <p>Revelation: {revelationPlace}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2 flex items-center">
              <span className="font-arabic text-base text-white/90" dir="rtl">{nameArabic}</span>
              <span className="ml-2 text-xs text-white/50">({revelationPlace})</span>
            </div>
          </div>

          {/* Chapter navigation */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={chapterNumber <= 1}
              onClick={onPrevious}
              className={cn(
                "h-8 w-8 rounded-full relative overflow-hidden border-0",
                !chapterNumber <= 1 ? "hover:bg-white/5 text-white/70 hover:text-white" : "text-white/30"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={chapterNumber >= 114}
              onClick={onNext}
              className={cn(
                "h-8 w-8 rounded-full relative overflow-hidden border-0",
                !chapterNumber >= 114 ? "hover:bg-white/5 text-white/70 hover:text-white" : "text-white/30"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative bottom border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
    </div>
  );
}
