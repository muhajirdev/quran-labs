import { useState, forwardRef } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ExternalLink,
  Copy,
  Bookmark,
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

interface Translation {
  id?: number;
  text: string;
  language?: string;
  translator?: string;
}

interface VerseItemProps {
  verseKey: string;
  arabicText: string;
  translations?: Translation[];
  showDetailLink?: boolean;
  isHighlighted?: boolean;
}

export const VerseItem = forwardRef<HTMLDivElement, VerseItemProps>(({
  verseKey,
  arabicText,
  translations = [],
  showDetailLink = true,
  isHighlighted = false
}, ref) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Get the first translation (usually English)
  const primaryTranslation = translations && translations.length > 0
    ? translations[0]
    : null;

  // Handle copy to clipboard
  const handleCopy = () => {
    const textToCopy = `${arabicText}\n\n${primaryTranslation?.text || ''}\n\n(Quran ${verseKey})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Handle bookmark
  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // In a real app, you would save this to localStorage or a database
  };

  return (
    <div
      ref={ref}
      className={`group relative transition-colors duration-500 ${isHighlighted ? 'bg-accent/10 rounded-lg p-3 -mx-3' : ''}`}
    >
      {/* Verse actions at the top */}
      <div className="flex justify-between items-center mb-4">
        {/* Verse number badge */}
        <Link
          to={`/verse/${verseKey}`}
          className="hover:text-accent transition-colors"
        >
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors text-xs">
            {verseKey}
          </Badge>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-1 sm:gap-2 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-0 bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white shadow-sm"
                >
                  <Copy className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${copied ? 'text-accent' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy verse'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBookmark}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-0 bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white shadow-sm"
                >
                  <Bookmark className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${bookmarked ? 'fill-accent text-accent' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{bookmarked ? 'Bookmarked' : 'Bookmark verse'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* AI Assistant Button */}
          <AskAIButton
            context={{
              entityType: "verse",
              entityId: verseKey,
              text: primaryTranslation?.text
            }}
            size="sm"
            options={[
              {
                id: 'general',
                label: 'Tell me about this verse',
                icon: SparklesIcon,
                prompt: (ctx) => `Tell me about verse ${ctx.entityId}`
              },
              {
                id: 'lessons',
                label: 'Key lessons',
                icon: BookIcon,
                prompt: (ctx) => `What are the key lessons from verse ${ctx.entityId}?`
              },
              {
                id: 'context',
                label: 'Historical context',
                icon: HistoryIcon,
                prompt: (ctx) => `What is the historical context of verse ${ctx.entityId}?`
              },
              {
                id: 'scholars',
                label: 'Scholarly views',
                icon: GraduationCapIcon,
                prompt: (ctx) => `What do scholars say about verse ${ctx.entityId}?`
              },
              {
                id: 'apply',
                label: 'Apply today',
                icon: LightbulbIcon,
                prompt: (ctx) => `How can I apply verse ${ctx.entityId} in today's world?`
              },
              {
                id: 'explain',
                label: 'General explanation',
                icon: FileTextIcon,
                prompt: (ctx) => `Explain verse ${ctx.entityId} in simple terms.`
              },
              {
                id: 'personal',
                label: 'Relevant to my life',
                icon: HeartIcon,
                prompt: (ctx) => `How might verse ${ctx.entityId} be relevant to my life?`
              },
            ]}
          />

          {showDetailLink && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border-0 bg-white/[0.03] hover:bg-white/10 text-white/70 hover:text-white shadow-sm"
                  >
                    <Link to={`/verse/${verseKey}`}>
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View verse details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Content with elegant spacing */}
      <div className="pb-8 relative">
        {/* Arabic text */}
        <div className="mb-4 sm:mb-6 group relative">
          <div className="absolute -left-2 sm:-left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-xl sm:text-2xl font-arabic arabic-xl leading-loose text-white/90 break-words" dir="rtl" lang="ar">
            {arabicText}
          </p>
        </div>

        {/* Translation */}
        {primaryTranslation && (
          <div className="text-sm sm:text-base leading-relaxed text-white/70 break-words">
            {primaryTranslation.text}
            {primaryTranslation.translator && (
              <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-white/40 flex items-center gap-1">
                <span>Translation:</span>
                <span className="font-medium text-white/50">{primaryTranslation.translator}</span>
              </div>
            )}
          </div>
        )}

        {/* Subtle verse separator */}
        <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
    </div >
  );
});
