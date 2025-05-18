"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ArrowRight, ExternalLink, BookOpen, Share2 } from "lucide-react"
import { Link } from "react-router"
import { fetchVerseData } from "~/lib/quran-api"

interface VerseReferenceSheetProps {
  state: string
  args: {
    verseReference?: string
  }
  result?: any
}

interface VerseData {
  verse_key: string
  chapter_number: number
  verse_number: number
  arabic_text: string
  chapter_name: string
  chapter_name_arabic?: string
  translations: {
    [key: string]: {
      text: string
      translator: string
    }
  }
  topics?: Array<{
    topic_id: number
    name: string
    description?: string
  }>
  isLoading: boolean
  error?: string
}

export function VerseReferenceSheet({ state, args, result }: VerseReferenceSheetProps) {
  const [verseData, setVerseData] = React.useState<VerseData>({
    verse_key: '',
    chapter_number: 0,
    verse_number: 0,
    arabic_text: '',
    chapter_name: '',
    translations: {},
    isLoading: true
  })

  const verseReference = args.verseReference || '';

  // Extract chapter and verse numbers
  const [chapter, verse] = verseReference.split(':').map(num => parseInt(num));

  // Fetch verse data when component mounts
  React.useEffect(() => {
    if ((state === 'call' || state === 'result') && chapter && verse) {
      fetchVerseDataForComponent(chapter, verse);
    }
  }, [state, chapter, verse]);

  const fetchVerseDataForComponent = async (chapter: number, verse: number) => {
    try {
      // Use our utility function to fetch verse data
      const verseReference = `${chapter}:${verse}`;
      const data = await fetchVerseData(verseReference);

      if (data.error) {
        throw new Error(data.error);
      }

      setVerseData({
        ...data,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching verse data:', error);
      setVerseData({
        verse_key: `${chapter}:${verse}`,
        chapter_number: chapter,
        verse_number: verse,
        arabic_text: '',
        chapter_name: `Chapter ${chapter}`,
        translations: {},
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load verse data'
      });
    }
  };

  if (state === 'partial-call' || (state !== 'partial-call' && verseData.isLoading)) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mb-4 relative">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
            <span className="text-2xl relative z-10">📖</span>
          </div>
          <div className="h-6 w-48 bg-secondary/50 dark:bg-accent/20 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-secondary/30 dark:bg-accent/10 rounded-md"></div>
          <div className="mt-8 space-y-3 w-full max-w-md">
            <div className="h-20 bg-secondary/50 dark:bg-black/30 rounded-md w-full border border-border/50 dark:border-[rgba(58,58,58,0.5)]"></div>
            <div className="h-24 bg-secondary/50 dark:bg-black/30 rounded-md w-full border border-border/50 dark:border-[rgba(58,58,58,0.5)]"></div>
            <div className="h-4 bg-secondary/30 dark:bg-accent/10 rounded-md w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (verseData.error) {
    return (
      <div className="p-4">
        <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-6">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mr-4 relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-destructive rounded-full blur-[6px] opacity-30"></div>
              <span className="text-2xl relative z-10">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground dark:text-white">Error Loading Verse</h3>
              <p className="text-sm text-muted-foreground dark:text-white/60">{verseReference}</p>
            </div>
          </div>
          <div className="bg-secondary/50 dark:bg-black/30 rounded-md p-5 border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <p className="text-sm text-foreground dark:text-white/80">
              {verseData.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get the English translation if available, or the first available translation
  const translationLanguages = Object.keys(verseData.translations);
  const translationKey = translationLanguages.includes('en') ? 'en' : translationLanguages[0];
  const translation = translationKey ? verseData.translations[translationKey] : null;

  return (
    <div className="p-4">
      <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4 relative group">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
              <span className="text-2xl relative z-10">📖</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground dark:text-white">{verseData.chapter_name}</h3>
              <p className="text-sm text-muted-foreground dark:text-white/60">Verse {verseData.verse_number}</p>
            </div>
          </div>
          <Link to={`/verse/${verseData.verse_key}`} className="text-accent hover:text-accent/80 transition-colors">
            <Button variant="ghost" size="sm" className="gap-1">
              <span>View</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {verseData.arabic_text && (
          <div className="mb-5 bg-secondary/50 dark:bg-black/30 rounded-md p-5 border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <p className="text-right font-arabic text-2xl leading-loose text-foreground dark:text-white/90">
              {verseData.arabic_text}
            </p>
          </div>
        )}

        {translation && (
          <div className="bg-secondary/50 dark:bg-black/30 rounded-md p-5 border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <p className="text-sm text-foreground dark:text-white/80 leading-relaxed">
              {translation.text}
            </p>
            <p className="text-xs text-muted-foreground dark:text-white/50 mt-3">
              Translator: {translation.translator}
            </p>
          </div>
        )}

        {verseData.topics && verseData.topics.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-medium text-foreground/70 dark:text-white/70 mb-2">Topics:</h4>
            <div className="flex flex-wrap gap-2">
              {verseData.topics.map((topic, index) => (
                <span
                  key={index}
                  className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full"
                >
                  {topic.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <Link to={`/read?chapter=${verseData.chapter_number}&verse=${verseData.verse_number}`} className="text-accent hover:text-accent/80 transition-colors">
            <Button variant="outline" size="sm" className="gap-1.5 border-accent/20 hover:bg-accent/5">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Read in context</span>
            </Button>
          </Link>

          <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verseData.verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`} className="text-accent hover:text-accent/80 transition-colors">
            <Button variant="outline" size="sm" className="gap-1.5 border-accent/20 hover:bg-accent/5">
              <Share2 className="h-3.5 w-3.5" />
              <span>Explore connections</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
