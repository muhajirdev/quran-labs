import { useState, useEffect } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/read";
import { VerseItem } from "~/components/quran/VerseItem";
import { VerseItemSkeleton } from "~/components/quran/VerseItemSkeleton";
import { ChapterInfo } from "~/components/quran/ChapterInfo";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";

import { BookOpen } from "lucide-react";

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

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Additional background effects */}
      <div className="absolute top-[-150px] right-[-150px] w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]"></div>
      <div className="absolute bottom-[-180px] left-[-180px] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>

      {/* Header - Fixed position with consistent blur and transition */}
      <header className="fixed top-0 left-0 right-0 z-10 transition-all duration-300 backdrop-blur-md">
        <div className="flex items-center justify-between py-3 px-3 sm:px-6 relative z-10">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => window.location.href = '/'}
              className="font-medium text-sm tracking-wide text-white hover:text-accent transition-all duration-300 flex items-center group"
            >
              <span className="relative mr-1.5">
                <Logo size="sm" className="group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></span>
              </span>
              <span className="group-hover:tracking-wider transition-all duration-300">Quran Reader</span>
            </button>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-3">
            {/* Chapter selector */}
            <div className="w-48">
              <Select
                value={selectedChapter.toString()}
                onValueChange={handleChapterChange}
              >
                <SelectTrigger className="h-8 bg-white/[0.02] border-white/[0.06] text-white focus:ring-accent/30 focus:border-accent/20">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 text-white">
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter.number} value={chapter.number.toString()} className="focus:bg-white/10 focus:text-white">
                      {chapter.number}. {chapter.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Translation selector */}
            <div className="w-56 hidden sm:block">
              <Select
                value={currentTranslation}
                onValueChange={handleTranslationChange}
              >
                <SelectTrigger className="h-8 bg-white/[0.02] border-white/[0.06] text-white focus:ring-accent/30 focus:border-accent/20">
                  <SelectValue placeholder="Select translation" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10 text-white">
                  {availableTranslations.map((translation) => (
                    <SelectItem key={translation.identifier} value={translation.identifier} className="focus:bg-white/10 focus:text-white">
                      {translation.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mobile translation selector */}
        <div className="sm:hidden px-3 pb-3">
          <Select
            value={currentTranslation}
            onValueChange={handleTranslationChange}
          >
            <SelectTrigger className="h-8 w-full bg-white/[0.02] border-white/[0.06] text-white focus:ring-accent/30 focus:border-accent/20">
              <SelectValue placeholder="Select translation" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-white/10 text-white">
              {availableTranslations.map((translation) => (
                <SelectItem key={translation.identifier} value={translation.identifier} className="focus:bg-white/10 focus:text-white">
                  {translation.englishName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Header bottom border */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </header>

      {/* Main content - Centered with padding for fixed header */}
      <main className="flex-1 flex flex-col overflow-hidden pt-20 pb-20 sm:pb-24">
        <div className="max-w-3xl mx-auto w-full px-3 sm:px-6 py-6 relative">
          {error && (
            <div className="mb-6 rounded-lg overflow-hidden bg-destructive/10 backdrop-blur-sm border border-destructive/30">
              <div className="p-4">
                <p className="text-destructive">Error: {error}</p>
              </div>
            </div>
          )}

          {/* Chapter info */}
          {currentChapter && (
            <div className="mb-6">
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
          )}

          {/* Verses */}
          <div className="rounded-lg overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/[0.06]">
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="font-medium text-white">Verses</span>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-white/50">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
                  <span className="text-xs">Loading...</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="space-y-8">
                {isLoading ? (
                  // Show skeletons while loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <VerseItemSkeleton key={index} />
                  ))
                ) : (
                  // Show actual verses when loaded
                  verses.map((verse) => (
                    <VerseItem
                      key={verse.verse_key}
                      verseKey={verse.verse_key}
                      arabicText={verse.text_uthmani}
                      translations={verse.translations}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer area with experimental warning */}
      <div className="fixed bottom-0 left-0 right-0 z-10 w-full px-3 sm:px-6 py-3 sm:py-4 transition-all duration-300">
        <div className="absolute inset-0 blur-layer"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>

        <div className="max-w-xl mx-auto relative z-10">
          {/* Enhanced experimental warning message with elegant styling */}
          <div className="flex items-center justify-center relative">
            {/* Subtle decorative elements */}
            <div className="absolute left-1/2 -translate-x-1/2 w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="px-2 sm:px-4 py-1 sm:py-2 relative">
              <p className="text-[9px] sm:text-[10px] text-white/30 text-center flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 group">
                <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
                <span className="group-hover:text-white/40 transition-colors duration-300 text-center">
                  Experimental research preview - Please verify information for accuracy
                </span>
                <span className="hidden sm:inline-block w-3 h-px bg-white/20 group-hover:w-5 transition-all duration-500"></span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
