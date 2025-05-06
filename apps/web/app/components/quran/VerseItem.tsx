import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ExternalLink,
  Copy,
  Bookmark
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

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
}

export function VerseItem({
  verseKey,
  arabicText,
  translations = [],
  showDetailLink = true
}: VerseItemProps) {
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
    <div className="pb-6 border-b border-white/10 last:border-0 group">
      <div className="flex justify-between items-center mb-4">
        <Link
          to={`/verse/${verseKey}`}
          className="hover:text-accent transition-colors"
        >
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 hover:bg-accent/20 transition-colors">
            {verseKey}
          </Badge>
        </Link>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-7 w-7 rounded-full border-0 hover:bg-white/5 text-white/70 hover:text-white"
                >
                  <Copy className={`h-3.5 w-3.5 ${copied ? 'text-accent' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#121212] border-white/10 text-white">
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
                  className="h-7 w-7 rounded-full border-0 hover:bg-white/5 text-white/70 hover:text-white"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? 'fill-accent text-accent' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#121212] border-white/10 text-white">
                <p>{bookmarked ? 'Bookmarked' : 'Bookmark verse'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {showDetailLink && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2.5 rounded-full border-0 hover:bg-white/5 text-white/70 hover:text-white"
            >
              <Link to={`/verse/${verseKey}`} className="flex items-center gap-1 text-xs">
                <span>Details</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Arabic text */}
      <div className="mb-4 group relative">
        <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <p className="text-xl font-arabic arabic-xl leading-loose text-white/90" dir="rtl" lang="ar">
          {arabicText}
        </p>
      </div>

      {/* Translation */}
      {primaryTranslation && (
        <div className="text-base leading-relaxed text-white/70">
          {primaryTranslation.text}
          {primaryTranslation.translator && (
            <div className="mt-3 text-xs text-white/50 flex items-center gap-1">
              <span>Translation:</span>
              <span className="font-medium">{primaryTranslation.translator}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
