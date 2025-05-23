"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { ArrowRight, ExternalLink, BookOpen, Share2 } from "lucide-react";
import { Link } from "react-router";
import { fetchVerseData } from "~/lib/quran-api";

interface VerseReferenceCardProps {
  state: string;
  args: {
    verseReference?: string;
  };
  result?: any;
}

interface VerseData {
  verse_key: string;
  chapter_number: number;
  verse_number: number;
  arabic_text: string;
  chapter_name: string;
  chapter_name_arabic?: string;
  translations: {
    [key: string]: {
      text: string;
      translator: string;
    };
  };
  topics?: Array<{
    topic_id: number;
    name: string;
    description?: string;
  }>;
  isLoading: boolean;
  error?: string;
}

export function VerseReferenceCard({
  state,
  args,
  result,
}: VerseReferenceCardProps) {
  const [verseData, setVerseData] = React.useState<VerseData>({
    verse_key: "",
    chapter_number: 0,
    verse_number: 0,
    arabic_text: "",
    chapter_name: "",
    translations: {},
    isLoading: true,
  });

  const verseReference = args.verseReference || "";

  // Extract chapter and verse numbers
  const [chapter, verse] = verseReference
    .split(":")
    .map((num) => parseInt(num));

  // Get gradient background based on verse key seed
  const getVerseGradient = (verseKey: string) => {
    const gradients = [
      "from-slate-500 via-blue-600 to-indigo-700", // Contemplative
      "from-emerald-600 via-teal-700 to-cyan-800", // Quranic wisdom
      "from-rose-500 via-purple-600 to-indigo-700", // Emotional reflection
      "from-amber-500 via-orange-600 to-pink-700", // Uplifting energy
      "from-purple-500 via-pink-600 to-red-600", // Comforting
      "from-green-500 via-teal-600 to-blue-700", // Inspiring
      "from-orange-500 via-red-600 to-pink-700", // Personal story
      "from-blue-500 via-cyan-600 to-teal-700", // Hope message
      "from-violet-500 via-purple-600 to-indigo-700", // Spiritual insight
      "from-yellow-500 via-green-600 to-emerald-700", // Uplifting wisdom
      "from-cyan-500 via-blue-600 to-indigo-700", // Contemplative depth
      "from-lime-500 via-green-600 to-emerald-700", // Practical guidance
      "from-pink-500 via-rose-600 to-purple-700", // Comforting reflection
      "from-stone-600 via-gray-700 to-slate-800", // Grounding
      "from-indigo-500 via-purple-600 to-pink-700", // Reflective hope
    ];

    // Create consistent seed from verse key
    const seed = verseKey
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[seed % gradients.length];
  };

  // Fetch verse data when component mounts
  React.useEffect(() => {
    if ((state === "call" || state === "result") && chapter && verse) {
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
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching verse data:", error);
      setVerseData({
        verse_key: `${chapter}:${verse}`,
        chapter_number: chapter,
        verse_number: verse,
        arabic_text: "",
        chapter_name: `Chapter ${chapter}`,
        translations: {},
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load verse data",
      });
    }
  };

  // Loading state
  if (state === "partial-call" || state === "call" || verseData.isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8">
        <div className="relative h-[60vh] rounded-3xl shadow-2xl overflow-hidden">
          {/* Loading gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600" />

          {/* Loading content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <div className="h-8 w-64 bg-white/20 rounded-lg mb-4"></div>
              <div className="h-6 w-48 bg-white/10 rounded-lg mb-8"></div>
              <div className="space-y-3 w-full max-w-md">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-white/70 text-sm mt-6">
                Loading verse {verseReference}... 📖
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (verseData.error) {
    return (
      <div className="w-full max-w-4xl mx-auto my-8">
        <div className="relative h-[60vh] rounded-3xl shadow-2xl overflow-hidden">
          {/* Error gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-rose-500 to-pink-600" />

          {/* Error content */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Error Loading Verse
            </h3>
            <p className="text-white/80 text-lg mb-6">{verseReference}</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md">
              <p className="text-white/90 text-sm">{verseData.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the English translation if available, or the first available translation
  const translationLanguages = Object.keys(verseData.translations);
  const translationKey = translationLanguages.includes("en")
    ? "en"
    : translationLanguages[0];
  const translation = translationKey
    ? verseData.translations[translationKey]
    : null;

  // Get the gradient for this verse
  const selectedGradient = getVerseGradient(
    verseData.verse_key || verseReference
  );

  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      <div className="relative rounded-2xl shadow-xl overflow-hidden">
        {/* Beautiful Gradient Background - Dynamic based on verse */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${selectedGradient}`}
        />

        {/* Static Grain Texture Overlay */}
        <div className="absolute inset-0">
          {/* Primary grain */}
          <div
            className="absolute inset-0 opacity-60 mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 1200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='primaryGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='3' seed='42' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23primaryGrain)'/%3E%3C/svg%3E")`,
              backgroundSize: "1000px 1000px",
            }}
          />

          {/* Fine grain layer */}
          <div
            className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 900 900' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fineGrain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.4' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fineGrain)'/%3E%3C/svg%3E")`,
              backgroundSize: "700px 700px",
            }}
          />
        </div>

        {/* Subtle Depth Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white font-medium text-sm">
                  {verseData.verse_key}
                </span>
              </div>
              <span className="text-white/70 text-sm">
                {verseData.chapter_name}
              </span>
            </div>
            <span className="text-white/50 text-xs uppercase tracking-wider">
              Quranic Verse
            </span>
          </div>

          {/* Arabic Text */}
          {verseData.arabic_text && (
            <div className="mb-4">
              <p className="text-right font-arabic text-xl md:text-2xl leading-relaxed text-white">
                {verseData.arabic_text}
              </p>
            </div>
          )}

          {/* Translation */}
          {translation && (
            <div className="mb-4">
              <p className="text-sm md:text-base text-white/90 leading-relaxed">
                {translation.text}
              </p>
              <p className="text-white/60 text-xs mt-2">
                — {translation.translator}
              </p>
            </div>
          )}

          {/* Topics and Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Topics */}
            {verseData.topics && verseData.topics.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {verseData.topics.slice(0, 3).map((topic, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/15 backdrop-blur-sm text-white px-2 py-1 rounded-full"
                  >
                    {topic.name}
                  </span>
                ))}
                {verseData.topics.length > 3 && (
                  <span className="text-xs bg-white/15 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                    +{verseData.topics.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Link to={`/verse/${verseData.verse_key}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm rounded-lg text-xs px-3"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </Link>

              <Link
                to={`/read?chapter=${verseData.chapter_number}&verse=${verseData.verse_number}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm rounded-lg text-xs px-3"
                >
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Context
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
