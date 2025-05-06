import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/read";
import { VerseItem } from "~/components/quran/VerseItem";
import { VerseItemSkeleton } from "~/components/quran/VerseItemSkeleton";
import { ChapterInfo } from "~/components/quran/ChapterInfo";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Reader | Quran Knowledge Graph" },
    { name: "description", content: "Read the Quran with translations and explore its meanings" },
  ];
}

// Define types for API responses
interface ChapterInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean | { recommended: boolean; obligatory: boolean };
}

interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

// Client-side loader to fetch initial data
export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const chapterParam = url.searchParams.get('chapter');
  const chapter = chapterParam ? parseInt(chapterParam, 10) : 1;
  const editionParam = url.searchParams.get('edition') || 'quran-uthmani';
  const translationParam = url.searchParams.get('translation') || 'en.sahih';

  try {
    // Fetch chapters list
    const chaptersResponse = await fetch('https://api.alquran.cloud/v1/surah');
    if (!chaptersResponse.ok) {
      throw new Error('Failed to fetch chapters');
    }
    const chaptersData = await chaptersResponse.json() as ApiResponse<ChapterInfo[]>;
    const chapters = chaptersData.data || [];

    // Fetch Arabic text for the selected chapter
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${chapter}/${editionParam}`);
    if (!arabicResponse.ok) {
      throw new Error('Failed to fetch Arabic text');
    }
    const arabicData = await arabicResponse.json() as ApiResponse<{ ayahs: Verse[], number: number, name: string, englishName: string, englishNameTranslation: string, numberOfAyahs: number, revelationType: string }>;

    // Fetch translation for the selected chapter
    const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${chapter}/${translationParam}`);
    if (!translationResponse.ok) {
      throw new Error('Failed to fetch translation');
    }
    const translationData = await translationResponse.json() as ApiResponse<{ ayahs: Verse[] }>;

    // Fetch available editions/translations
    const editionsResponse = await fetch('https://api.alquran.cloud/v1/edition/type/translation');
    if (!editionsResponse.ok) {
      throw new Error('Failed to fetch editions');
    }
    const editionsData = await editionsResponse.json() as ApiResponse<Edition[]>;
    const translations = editionsData.data || [];

    // Combine Arabic and translation data
    const arabicVerses = arabicData.data.ayahs || [];
    const translationVerses = translationData.data.ayahs || [];

    const verses = arabicVerses.map((verse: Verse, index: number) => {
      return {
        number: verse.number,
        verse_key: `${chapter}:${verse.numberInSurah}`,
        verse_number: verse.numberInSurah,
        text_uthmani: verse.text,
        translations: [
          {
            text: translationVerses[index]?.text || '',
            language: translationParam.split('.')[0] || 'en',
            translator: translationParam.split('.')[1] || 'unknown'
          }
        ]
      };
    });

    return {
      chapters,
      verses,
      selectedChapter: chapter,
      currentEdition: editionParam,
      currentTranslation: translationParam,
      availableTranslations: translations,
      chapterInfo: arabicData.data
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      chapters: [],
      verses: [],
      selectedChapter: chapter,
      currentEdition: editionParam,
      currentTranslation: translationParam,
      availableTranslations: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

clientLoader.hydrate = true as const;

export default function QuranReader() {
  const {
    chapters,
    verses,
    selectedChapter,
    error,
    currentTranslation,
    availableTranslations,
    chapterInfo
  } = useLoaderData<typeof clientLoader>();
  const [, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Handle scroll events to show/hide header on all devices
  useEffect(() => {
    // Track scroll direction and position
    let lastScrollY = window.scrollY;
    let ticking = false;
    let isScrollingDown = false;
    let lastDirection: 'up' | 'down' | null = null;
    let directionChangeTimestamp = 0;
    let lastHeaderChangeTime = 0;

    // Minimum time between direction changes and header visibility changes (ms)
    const directionChangeThreshold = 200;
    const headerChangeThreshold = 300;

    // Check if we're at the bottom of the page with some margin
    const isNearBottom = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY + windowHeight;
      // Consider "near bottom" if within 150px of the bottom
      return documentHeight - scrollPosition < 150;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const currentTime = Date.now();

          // Determine scroll direction
          const currentDirection: 'up' | 'down' = currentScrollY > lastScrollY ? 'down' : 'up';

          // Check if direction changed
          const directionChanged = lastDirection !== null && currentDirection !== lastDirection;

          // Update last direction if it changed and enough time has passed
          if (directionChanged && (currentTime - directionChangeTimestamp > directionChangeThreshold)) {
            lastDirection = currentDirection;
            directionChangeTimestamp = currentTime;
            isScrollingDown = currentDirection === 'down';
          } else if (lastDirection === null) {
            // First scroll event
            lastDirection = currentDirection;
            isScrollingDown = currentDirection === 'down';
          }

          // Only change header visibility if enough time has passed since last change
          // This prevents rapid toggling
          if (currentTime - lastHeaderChangeTime > headerChangeThreshold) {
            // Don't change header state when near the bottom of the page
            if (!isNearBottom()) {
              // Only update header visibility based on established scroll direction
              if (isScrollingDown && currentScrollY > 60) {
                if (isHeaderVisible) {
                  setIsHeaderVisible(false);
                  lastHeaderChangeTime = currentTime;
                }
              } else if (!isScrollingDown) {
                if (!isHeaderVisible) {
                  setIsHeaderVisible(true);
                  lastHeaderChangeTime = currentTime;
                }
              }
            } else {
              // When near bottom, keep header visible to prevent vibration
              if (!isHeaderVisible) {
                setIsHeaderVisible(true);
                lastHeaderChangeTime = currentTime;
              }
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHeaderVisible]);

  // Handle chapter selection
  const handleChapterChange = (value: string) => {
    setIsLoading(true);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('chapter', value);
      return newParams;
    });
  };

  // Handle translation change
  const handleTranslationChange = (value: string) => {
    setIsLoading(true);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('translation', value);
      return newParams;
    });
  };

  // Reset loading state when verses change or on initial load
  useEffect(() => {
    // Short timeout to allow UI to render first
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [verses]);

  // Map chapter info to the format expected by ChapterInfo component
  const currentChapter = chapterInfo ? {
    chapter_number: chapterInfo.number,
    name_english: chapterInfo.englishName,
    name_arabic: chapterInfo.name,
    revelation_place: chapterInfo.revelationType,
    verses_count: chapterInfo.numberOfAyahs
  } : null;

  // Function to show header when tapped at the top of the screen
  const showHeader = () => {
    if (!isHeaderVisible) {
      setIsHeaderVisible(true);
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIsHeaderVisible(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Additional background effects */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] translate-x-1/4 -translate-y-1/4 rounded-full bg-accent/5 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] -translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-[120px]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>

      {/* Tap area to show header when it's hidden */}
      {!isHeaderVisible && (
        <div
          className="fixed top-0 left-0 right-0 h-8 z-20 cursor-pointer"
          onClick={showHeader}
          aria-label="Show navigation"
        >
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20"></div>
        </div>
      )}

      {/* Header - Fixed position with consistent blur and transition - Similar to AIChatExperience */}
      <header className={cn(
        "fixed left-0 right-0 z-10 transition-all duration-300 backdrop-blur-md",
        isHeaderVisible ? "top-0" : "-top-20"
      )}>
        <div className="flex items-center justify-between py-2 px-2 sm:py-3 sm:px-6 relative z-10">
          {/* Logo and Title */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="font-medium text-xs sm:text-sm tracking-wide text-white hover:text-accent transition-all duration-300 flex items-center group"
            >
              <span className="relative mr-1">
                <Logo size="sm" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
              </span>
              <span className="group-hover:tracking-wider transition-all duration-300">Quran Reader</span>
            </button>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Translation selector - Shown on all screen sizes but with adaptive width */}
            <Select
              value={currentTranslation}
              onValueChange={handleTranslationChange}
            >
              <SelectTrigger className="h-7 sm:h-8 w-[90px] sm:w-[180px] bg-white/[0.02] border-white/[0.06] text-white focus:ring-accent/30 focus:border-accent/20 text-xs sm:text-sm px-2 sm:px-3">
                <SelectValue placeholder="Translation" />
              </SelectTrigger>
              <SelectContent>
                {availableTranslations.map((translation) => (
                  <SelectItem key={translation.identifier} value={translation.identifier}>
                    {translation.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Chapter selector */}
            <Select
              value={selectedChapter.toString()}
              onValueChange={handleChapterChange}
            >
              <SelectTrigger className="h-7 sm:h-8 w-[90px] sm:w-[160px] bg-white/[0.02] border-white/[0.06] text-white focus:ring-accent/30 focus:border-accent/20 text-xs sm:text-sm px-2 sm:px-3">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.number} value={chapter.number.toString()}>
                    {chapter.number}. {chapter.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Header bottom border */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </header>

      {/* Main content - Immersive reading experience */}
      <main className={cn(
        "flex-1 pb-10 transition-all duration-300",
        isHeaderVisible ? "pt-16 sm:pt-20" : "pt-4"
      )}>
        {error && (
          <div className={cn(
            "fixed left-0 right-0 z-20 px-3 transition-all duration-300",
            isHeaderVisible ? "top-20" : "top-4"
          )}>
            <div className="max-w-md mx-auto rounded-lg overflow-hidden bg-destructive/10 backdrop-blur-sm border border-destructive/30 shadow-lg">
              <div className="p-3">
                <p className="text-destructive text-sm">Error: {error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chapter info */}
        {currentChapter && (
          <div className="px-3 sm:px-6 mb-6">
            <div className="max-w-3xl mx-auto">
              <ChapterInfo
                chapterNumber={currentChapter.chapter_number}
                nameEnglish={currentChapter.name_english}
                nameArabic={currentChapter.name_arabic}
                revelationPlace={currentChapter.revelation_place}
                versesCount={currentChapter.verses_count}
                onPrevious={() => handleChapterChange((selectedChapter - 1).toString())}
                onNext={() => handleChapterChange((selectedChapter + 1).toString())}
              />
            </div>
          </div>
        )}

        {/* Verses - Clean, immersive layout */}
        <div className="flex-1 px-3 sm:px-6 relative">
          <div className="max-w-3xl mx-auto">
            {isLoading ? (
              // Loading state
              <div className="space-y-12 py-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <VerseItemSkeleton key={index} />
                ))}
              </div>
            ) : (
              // Verses with elegant spacing
              <div className="space-y-12 py-6">
                {verses.map((verse) => (
                  <VerseItem
                    key={verse.verse_key}
                    verseKey={verse.verse_key}
                    arabicText={verse.text_uthmani}
                    translations={verse.translations}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Small experimental notice at the bottom */}
        <div className="mt-6 mb-4 text-center">
          <p className="text-[10px] text-white/30">
            Experimental research preview - Please verify information for accuracy
          </p>
        </div>
      </main>
    </div>
  );
}
