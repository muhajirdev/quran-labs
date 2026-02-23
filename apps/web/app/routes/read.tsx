import { useState, useEffect, useRef } from "react";
import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/read";
import { VerseItem } from "~/components/quran/VerseItem";
import { VerseItemSkeleton } from "~/components/quran/VerseItemSkeleton";
import { ChapterInfo } from "~/components/quran/ChapterInfo";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";
import { FloatingChatInterface } from "~/components/ai/FloatingChatInterface";
import { BookIcon, BookMarkedIcon, BrainCircuitIcon, LayersIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { chatMessagesAtom, chatMinimizedAtom } from "~/store/chat";
import { useAtom } from "jotai";
import { Footer } from "~/components/layout/Footer";

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
  const verseParam = url.searchParams.get('verse');

  // Parse verse parameter (format can be either "2:255" or just "255" if chapter is specified)
  let targetChapter = chapterParam ? parseInt(chapterParam, 10) : 1;
  let targetVerse: number | null = null;

  if (verseParam) {
    // Check if verse parameter contains chapter:verse format
    if (verseParam.includes(':')) {
      const [chapterStr, verseStr] = verseParam.split(':');
      targetChapter = parseInt(chapterStr, 10);
      targetVerse = parseInt(verseStr, 10);
    } else {
      // Just verse number, use with the specified chapter
      targetVerse = parseInt(verseParam, 10);
    }
  }

  const chapter = targetChapter;
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
      chapterInfo: arabicData.data,
      targetVerse: targetVerse
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
      targetVerse: targetVerse,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

clientLoader.hydrate = true as const;

// Define Quran reader specific suggestions for the AI chat
const QURAN_READER_SUGGESTIONS = [
  { text: "Go to next chapter", icon: <ChevronRight className="h-3 w-3" /> },
  { text: "Go to previous chapter", icon: <ChevronLeft className="h-3 w-3" /> },
  { text: "Change translation", icon: <LayersIcon className="h-3 w-3" /> },
  { text: "Go to chapter 1", icon: <BookIcon className="h-3 w-3" /> },
  { text: "Explain this chapter", icon: <BookMarkedIcon className="h-3 w-3" /> },
  { text: "What can you do?", icon: <BrainCircuitIcon className="h-3 w-3" /> },
];

export default function QuranReader() {
  const {
    chapters,
    verses,
    selectedChapter,
    error,
    currentTranslation,
    availableTranslations,
    chapterInfo,
    targetVerse
  } = useLoaderData<typeof clientLoader>();

  // Create refs for verses that need to be scrolled to
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom);
  const [chatMinimized, setChatMinimized] = useAtom(chatMinimizedAtom);

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

      // After loading is complete, scroll to the target verse if specified
      if (targetVerse && !isLoading) {
        const verseKey = `${selectedChapter}:${targetVerse}`;
        const verseElement = verseRefs.current[verseKey];

        if (verseElement) {
          // Scroll to the verse with a small offset for better visibility
          const headerOffset = 80; // Adjust based on your header height
          const elementPosition = verseElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          // Smooth scroll to the verse
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Highlight the verse temporarily
          verseElement.classList.add('bg-accent/10');
          setTimeout(() => {
            verseElement.classList.remove('bg-accent/10');
          }, 2000);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [verses, targetVerse, selectedChapter, isLoading]);

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

  // Function to handle AI chat messages
  const handleSendMessage = async (queryText: string) => {
    // Get the current chapter information for context
    const chapterName = chapterInfo?.englishName || `Chapter ${selectedChapter}`;
    const verseCount = verses.length;

    // Generate a response based on the query and current chapter
    let response = "";

    // Handle navigation and control actions
    if (queryText.toLowerCase().includes("next chapter") || queryText.toLowerCase().includes("go to next")) {
      if (selectedChapter < 114) {
        // Navigate to next chapter
        handleChapterChange((selectedChapter + 1).toString());
        response = `Navigating to Chapter ${selectedChapter + 1}: ${chapters.find(c => c.number === selectedChapter + 1)?.englishName || ''}`;
      } else {
        response = `You're already at Chapter 114 (An-Nas), which is the last chapter of the Quran.`;
      }
    }
    else if (queryText.toLowerCase().includes("previous chapter") || queryText.toLowerCase().includes("go to previous")) {
      if (selectedChapter > 1) {
        // Navigate to previous chapter
        handleChapterChange((selectedChapter - 1).toString());
        response = `Navigating to Chapter ${selectedChapter - 1}: ${chapters.find(c => c.number === selectedChapter - 1)?.englishName || ''}`;
      } else {
        response = `You're already at Chapter 1 (Al-Fatiha), which is the first chapter of the Quran.`;
      }
    }
    else if (queryText.toLowerCase().includes("change translation") || queryText.toLowerCase().includes("switch translation")) {
      // Show available translations
      response = `Here are some available translations:\n\n`;

      // List a few popular translations
      const popularTranslations = availableTranslations.slice(0, 5);
      popularTranslations.forEach((translation, index) => {
        response += `${index + 1}. ${translation.englishName} (${translation.identifier})\n`;
      });

      response += `\nYou can say "use translation [name or identifier]" to switch to a specific translation.`;
    }
    else if (queryText.toLowerCase().includes("use translation")) {
      // Extract the translation name or identifier
      const translationQuery = queryText.toLowerCase().replace("use translation", "").trim();

      // Find the matching translation
      const matchedTranslation = availableTranslations.find(t =>
        t.identifier.toLowerCase().includes(translationQuery) ||
        t.englishName.toLowerCase().includes(translationQuery)
      );

      if (matchedTranslation) {
        // Change the translation
        handleTranslationChange(matchedTranslation.identifier);
        response = `Changing translation to ${matchedTranslation.englishName} (${matchedTranslation.identifier})`;
      } else {
        response = `I couldn't find a translation matching "${translationQuery}". Try saying "change translation" to see available options.`;
      }
    }
    else if (queryText.toLowerCase().includes("go to chapter") || queryText.toLowerCase().includes("navigate to chapter")) {
      // Extract the chapter number
      const chapterMatch = queryText.match(/chapter\s+(\d+)/i);
      if (chapterMatch && chapterMatch[1]) {
        const chapterNum = parseInt(chapterMatch[1], 10);
        if (chapterNum >= 1 && chapterNum <= 114) {
          // Navigate to the specified chapter
          handleChapterChange(chapterNum.toString());
          response = `Navigating to Chapter ${chapterNum}: ${chapters.find(c => c.number === chapterNum)?.englishName || ''}`;
        } else {
          response = `The Quran has 114 chapters. Please specify a chapter number between 1 and 114.`;
        }
      } else {
        response = `To navigate to a specific chapter, please specify the chapter number (e.g., "Go to chapter 5").`;
      }
    }
    // Handle verse-specific queries
    else if (queryText.toLowerCase().includes("verse") && /verse\s+(\d+):(\d+)/i.test(queryText)) {
      // Extract verse reference
      const verseMatch = queryText.match(/verse\s+(\d+):(\d+)/i);
      if (verseMatch && verseMatch[1] && verseMatch[2]) {
        const chapterNum = parseInt(verseMatch[1], 10);
        const verseNum = parseInt(verseMatch[2], 10);
        const verseKey = `${chapterNum}:${verseNum}`;

        // Find the verse if we're already on the right chapter
        const verse = verses.find(v => v.verse_key === verseKey);

        if (chapterNum !== selectedChapter) {
          // We need to navigate to the correct chapter
          handleChapterChange(chapterNum.toString());
          response = `Navigating to Chapter ${chapterNum} to find verse ${verseKey}. Please ask about this verse again after the chapter loads.`;
        } else if (verse) {
          // We have the verse data
          const translation = verse.translations && verse.translations.length > 0
            ? verse.translations[0].text
            : "Translation not available";

          if (queryText.toLowerCase().includes("relevant to my life")) {
            response = `Verse ${verseKey} contains wisdom that can be personally relevant to your life. It says: "${translation}". This verse can guide your daily decisions and provide perspective on life's challenges.`;
          } else if (queryText.toLowerCase().includes("key lessons")) {
            response = `The key lessons from verse ${verseKey} include guidance on moral conduct, spiritual growth, and the relationship between humans and their Creator. The verse states: "${translation}"`;
          } else if (queryText.toLowerCase().includes("historical context")) {
            response = `Verse ${verseKey} was revealed during a significant period in Islamic history, providing context for understanding its message and application. The verse says: "${translation}"`;
          } else if (queryText.toLowerCase().includes("scholars say")) {
            response = `Scholars have provided various interpretations of verse ${verseKey}, emphasizing different aspects of its meaning and significance. The verse states: "${translation}"`;
          } else if (queryText.toLowerCase().includes("apply") && queryText.toLowerCase().includes("today")) {
            response = `Verse ${verseKey} can be applied today by understanding its core principles and adapting them to contemporary situations and challenges. The verse says: "${translation}"`;
          } else {
            response = `Verse ${verseKey} says: "${translation}". This verse addresses important spiritual and ethical principles that guide believers.`;
          }
        } else {
          response = `I couldn't find verse ${verseKey} in the current chapter. Please check the verse reference and try again.`;
        }
      }
    }
    // Handle informational queries
    else if (queryText.toLowerCase().includes("explain") || queryText.toLowerCase().includes("meaning")) {
      response = `${chapterName} (Chapter ${selectedChapter}) consists of ${verseCount} verses. It discusses themes of guidance, faith, and divine wisdom. This chapter was revealed in ${chapterInfo?.revelationType === "Meccan" ? "Mecca" : "Medina"} and is known for its profound spiritual teachings.`;
    }
    else if (queryText.toLowerCase().includes("historical context") || queryText.toLowerCase().includes("history")) {
      response = `${chapterName} was revealed during the ${chapterInfo?.revelationType === "Meccan" ? "early" : "later"} period of Prophet Muhammad's mission. ${chapterInfo?.revelationType === "Meccan" ? "Meccan chapters generally focus on faith, monotheism, and spiritual teachings." : "Medinan chapters often address social regulations, community building, and interactions with other faith communities."}`;
    }
    else if (queryText.toLowerCase().includes("daily life") || queryText.toLowerCase().includes("relate")) {
      response = `The teachings in ${chapterName} can be applied to daily life through practicing patience, gratitude, and mindfulness of God. The ethical principles emphasized in this chapter guide believers in their interactions with family, community, and society at large.`;
    }
    else if (queryText.toLowerCase().includes("bookmark") || queryText.toLowerCase().includes("save")) {
      // Simulate bookmarking the current chapter
      response = `I've bookmarked Chapter ${selectedChapter}: ${chapterName} for you. You can access your bookmarks later.`;
    }
    else if (queryText.toLowerCase().includes("copy") || queryText.toLowerCase().includes("share")) {
      // Simulate copying chapter information
      response = `I've copied information about Chapter ${selectedChapter}: ${chapterName} to your clipboard. You can now paste it elsewhere.`;
    }
    else if (queryText.toLowerCase().includes("help") || queryText.toLowerCase().includes("what can you do")) {
      response = `I can help you with the following actions while reading the Quran:\n\n` +
        `- Navigate between chapters (e.g., "Go to next chapter" or "Go to chapter 5")\n` +
        `- Change translations (e.g., "Change translation" or "Use translation Sahih")\n` +
        `- Explain the meaning and context of chapters\n` +
        `- Provide historical background\n` +
        `- Relate teachings to daily life\n` +
        `- Bookmark or copy verses\n\n` +
        `What would you like to do?`;
    }
    else {
      response = `I'd be happy to help you understand more about ${chapterName} (Chapter ${selectedChapter}). This chapter contains ${verseCount} verses and was revealed in ${chapterInfo?.revelationType === "Meccan" ? "Mecca" : "Medina"}. You can ask about its meanings, historical context, or how it relates to daily life. You can also navigate between chapters or change translations.`;
    }

    // Add the user message and AI response to the chat with a small delay to simulate thinking
    const userMessage = {
      role: "user" as const,
      content: queryText
    };

    // First add just the user message
    setChatMessages(prev => [...prev, userMessage]);

    // Then add the AI response after a small delay
    setTimeout(() => {
      const aiResponse = {
        role: "assistant" as const,
        content: response
      };

      setChatMessages(prev => [...prev, aiResponse]);
    }, 500);

    setChatMinimized(false);

    return response;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Additional background effects */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] translate-x-1/4 -translate-y-1/4 rounded-full bg-accent/5 blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] -translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-[120px]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>

      {/* Floating AI Chat Interface */}
      <FloatingChatInterface
        title="Quran Assistant"
        contextId={`Chapter ${selectedChapter}: ${chapterInfo?.englishName}`}
        suggestions={QURAN_READER_SUGGESTIONS}
        onSendMessage={handleSendMessage}
      />

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
                {verses.map((verse) => {
                  const isHighlighted = targetVerse === parseInt(verse.verse_key.split(':')[1]);

                  return (
                    <VerseItem
                      key={verse.verse_key}
                      ref={(el: HTMLDivElement | null) => { verseRefs.current[verse.verse_key] = el }}
                      verseKey={verse.verse_key}
                      arabicText={verse.text_uthmani}
                      translations={verse.translations}
                      isHighlighted={isHighlighted}
                    />
                  );
                })}
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
      <Footer />
    </div>
  );
}
