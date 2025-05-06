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
import {
  ChevronLeft,
  ChevronRight,
  Info,
  SparklesIcon,
  BookIcon,
  HistoryIcon,
  GraduationCapIcon,
  LightbulbIcon,
  FileTextIcon,
  HeartIcon
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { AskAIButton } from "~/components/ai/AskAIButton";

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
    <div className="rounded-lg overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.06] shadow-lg">
      <div className="px-3 sm:px-4 py-3">
        <div className="flex flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-medium text-white truncate">{chapterNumber}. {nameEnglish}</span>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors text-xs">
                {versesCount} verses
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex cursor-help">
                      <Info className="h-4 w-4 text-white/50 hover:text-white transition-colors" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Revelation: {revelationPlace}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-1 flex items-center">
              <span className="font-arabic text-sm sm:text-base text-white/90 truncate" dir="rtl">{nameArabic}</span>
              <span className="ml-2 text-[10px] sm:text-xs text-white/50">({revelationPlace})</span>
            </div>
          </div>

          {/* Chapter navigation */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              disabled={chapterNumber <= 1}
              onClick={onPrevious}
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 rounded-full relative overflow-hidden border-0",
                chapterNumber > 1 ? "hover:bg-white/5 text-white/70 hover:text-white" : "text-white/30"
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            {/* AI Assistant Button */}
            <AskAIButton
              context={{
                entityType: "chapter",
                entityId: chapterNumber.toString(),
                entityName: nameEnglish,
                revelationPlace: revelationPlace,
                versesCount: versesCount
              }}
              size="md"
              options={[
                {
                  id: 'general',
                  label: 'Tell me about this chapter',
                  icon: SparklesIcon,
                  prompt: (ctx) => `Tell me about Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''}`
                },
                {
                  id: 'lessons',
                  label: 'Key lessons',
                  icon: BookIcon,
                  prompt: (ctx) => `What are the key lessons from Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''}?`
                },
                {
                  id: 'context',
                  label: 'Historical context',
                  icon: HistoryIcon,
                  prompt: (ctx) => `What is the historical context of Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''}?`
                },
                {
                  id: 'scholars',
                  label: 'Scholarly views',
                  icon: GraduationCapIcon,
                  prompt: (ctx) => `What do scholars say about Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''}?`
                },
                {
                  id: 'apply',
                  label: 'Apply today',
                  icon: LightbulbIcon,
                  prompt: (ctx) => `How can I apply Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''} in today's world?`
                },
                {
                  id: 'personal',
                  label: 'Relevant to my life',
                  icon: HeartIcon,
                  prompt: (ctx) => `How might Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''} be relevant to my life?`
                },
                {
                  id: 'explain',
                  label: 'General explanation',
                  icon: FileTextIcon,
                  prompt: (ctx) => `Explain Chapter ${ctx.entityId}${ctx.entityName ? `: ${ctx.entityName}` : ''} in simple terms.`
                }
              ]}
            />

            <Button
              variant="ghost"
              size="icon"
              disabled={chapterNumber >= 114}
              onClick={onNext}
              className={cn(
                "h-7 w-7 sm:h-8 sm:w-8 rounded-full relative overflow-hidden border-0",
                chapterNumber < 114 ? "hover:bg-white/5 text-white/70 hover:text-white" : "text-white/30"
              )}
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative bottom border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
    </div>
  );
}
