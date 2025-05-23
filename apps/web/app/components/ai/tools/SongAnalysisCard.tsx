"use client";

import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Music,
  BookOpen,
  Heart,
  Lightbulb,
  Quote,
  Share2,
  QuoteIcon,
} from "lucide-react";
import { Logo } from "~/components/ui/logo";

interface SongAnalysisCardProps {
  state: string;
  args: any;
  result?: any;
}

interface SongAnalysisResult {
  songInfo: {
    title: string;
    artist: string;
    lyrics: string;
    thumbnail?: string;
  };

  // Dynamic slides - AI decides the flow
  slides: Array<{
    id: string;
    title: string;
    type:
      | "lyric_quote"
      | "emotional_reflection"
      | "quranic_wisdom"
      | "personal_story"
      | "hope_message"
      | "practical_guidance"
      | "spiritual_insight";
    content: {
      main: string;
      supporting?: string;
      quote?: string;
      attribution?: string;
    };
    emotion:
      | "contemplative"
      | "uplifting"
      | "comforting"
      | "inspiring"
      | "reflective";
  }>;
}

export function SongAnalysisCard({
  state,
  args,
  result,
}: SongAnalysisCardProps) {
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);
  const [isSwipeInProgress, setIsSwipeInProgress] = React.useState(false);

  // Minimum distance for a swipe (in pixels)
  const minSwipeDistance = 50;

  if (!result) return null;

  const analysis: SongAnalysisResult = result;

  // Get slide type icons and colors
  const getSlideIcon = (type: string) => {
    switch (type) {
      case "lyric_quote":
        return Music;
      case "emotional_reflection":
        return Heart;
      case "quranic_wisdom":
        return BookOpen;
      case "personal_story":
        return Heart;
      case "hope_message":
        return Quote;
      case "practical_guidance":
        return Lightbulb;
      case "spiritual_insight":
        return Quote;
      default:
        return Music;
    }
  };

  const getSlideColor = (emotion: string) => {
    switch (emotion) {
      case "contemplative":
        return "blue";
      case "uplifting":
        return "amber";
      case "comforting":
        return "purple";
      case "inspiring":
        return "green";
      case "reflective":
        return "blue";
      default:
        return "blue";
    }
  };

  // Get gradient background based on slide content and emotion
  const getGradientBackground = (slide: SongAnalysisResult["slides"][0]) => {
    const gradients = {
      // Lyric Quote - Music vibes
      lyric_quote: {
        contemplative: "from-slate-400 via-blue-500 to-indigo-600",
        uplifting: "from-yellow-400 via-orange-500 to-pink-500",
        comforting: "from-purple-400 via-pink-500 to-red-500",
        inspiring: "from-green-400 via-teal-500 to-blue-600",
        reflective: "from-gray-400 via-slate-500 to-blue-600",
      },
      // Emotional Reflection - Heart colors
      emotional_reflection: {
        contemplative: "from-rose-300 via-purple-400 to-indigo-500",
        uplifting: "from-amber-300 via-orange-400 to-pink-500",
        comforting: "from-pink-300 via-rose-400 to-purple-500",
        inspiring: "from-emerald-300 via-teal-400 to-cyan-500",
        reflective: "from-blue-300 via-indigo-400 to-purple-500",
      },
      // Quranic Wisdom - Sacred colors
      quranic_wisdom: {
        contemplative: "from-emerald-400 via-teal-500 to-cyan-600",
        uplifting: "from-yellow-300 via-green-400 to-emerald-500",
        comforting: "from-blue-300 via-indigo-400 to-purple-500",
        inspiring: "from-cyan-300 via-blue-400 to-indigo-500",
        reflective: "from-slate-300 via-gray-400 to-blue-500",
      },
      // Personal Story - Warm human colors
      personal_story: {
        contemplative: "from-orange-300 via-red-400 to-pink-500",
        uplifting: "from-yellow-300 via-orange-400 to-red-500",
        comforting: "from-pink-300 via-purple-400 to-indigo-500",
        inspiring: "from-green-300 via-emerald-400 to-teal-500",
        reflective: "from-gray-300 via-slate-400 to-indigo-500",
      },
      // Hope Message - Bright, optimistic
      hope_message: {
        contemplative: "from-blue-300 via-cyan-400 to-teal-500",
        uplifting: "from-yellow-200 via-orange-300 to-pink-400",
        comforting: "from-purple-300 via-pink-400 to-rose-500",
        inspiring: "from-green-200 via-emerald-300 to-cyan-400",
        reflective: "from-indigo-300 via-purple-400 to-pink-500",
      },
      // Practical Guidance - Earthy, grounding
      practical_guidance: {
        contemplative: "from-stone-400 via-gray-500 to-slate-600",
        uplifting: "from-amber-300 via-yellow-400 to-orange-500",
        comforting: "from-rose-300 via-pink-400 to-purple-500",
        inspiring: "from-lime-300 via-green-400 to-emerald-500",
        reflective: "from-blue-300 via-slate-400 to-gray-500",
      },
      // Spiritual Insight - Transcendent colors
      spiritual_insight: {
        contemplative: "from-violet-300 via-purple-400 to-indigo-500",
        uplifting: "from-cyan-200 via-blue-300 to-indigo-400",
        comforting: "from-pink-200 via-rose-300 to-purple-400",
        inspiring: "from-emerald-200 via-teal-300 to-cyan-400",
        reflective: "from-slate-200 via-blue-300 to-indigo-400",
      },
    };

    const slideGradients = gradients[slide.type] || gradients.spiritual_insight;
    return slideGradients[slide.emotion] || slideGradients.contemplative;
  };

  // Render dynamic slide content
  const renderSlideContent = (slide: SongAnalysisResult["slides"][0]) => {
    return (
      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12">
        {/* Content Type Label - Top Left */}
        <div className="mb-8">
          <span className="text-white/60 text-xs uppercase tracking-widest font-medium">
            {slide.type.replace("_", " ")} • {slide.emotion}
          </span>
        </div>

        {/* Main Content - Left Aligned */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl pb-24">
          {/* Featured Quote */}
          {slide.content.quote && (
            <div className="space-y-3 mb-8">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
                {slide.content.quote}
              </h1>
              {slide.content.attribution && (
                <p className="text-white/70 text-base md:text-lg font-light">
                  — {slide.content.attribution}
                </p>
              )}
            </div>
          )}

          {/* Title for non-quote content */}
          {!slide.content.quote && (
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[0.9] tracking-tight mb-8">
              {slide.title}
            </h1>
          )}

          <div className="space-y-6 max-w-2xl">
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
              {slide.content.main}
            </p>

            {slide.content.supporting && (
              <p className="text-base md:text-lg lg:text-xl text-white/70 leading-relaxed font-light">
                {slide.content.supporting}
              </p>
            )}
          </div>

          {/* Attribution for non-quote content */}
          {!slide.content.quote && slide.content.attribution && (
            <p className="text-white/60 text-sm md:text-base mt-8 font-light">
              + {slide.content.attribution}
            </p>
          )}
        </div>
      </div>
    );
  };

  // Build slides from the dynamic analysis
  const slides = analysis.slides.map((slide, index) => ({
    id: slide.id,
    title: slide.title,
    icon: getSlideIcon(slide.type),
    color: getSlideColor(slide.emotion),
    content: renderSlideContent(slide),
  }));

  // Touch handlers (defined after slides is available)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwipeInProgress(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsSwipeInProgress(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next slide
      setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1));
    }
    if (isRightSwipe) {
      // Swipe right - go to previous slide
      setActiveSlide((prev) => Math.max(0, prev - 1));
    }

    setIsSwipeInProgress(false);
  };

  // Loading state
  if (state === "partial-call" || state === "call") {
    return (
      <div className="w-full max-w-2xl mx-auto my-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 p-6">
          <div className="animate-pulse flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center mb-4">
              <Music className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="h-6 w-48 bg-blue-200 dark:bg-blue-800 rounded-md mb-2"></div>
            <div className="h-4 w-32 bg-blue-100 dark:bg-blue-900 rounded-md mb-4"></div>
            <div className="space-y-3 w-full">
              <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-4">
              Finding the spiritual vibes in this song... ✨
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (result?.error) {
    return (
      <div className="w-full max-w-2xl mx-auto my-4">
        <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-700/30 p-6">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Analysis Error
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">
              {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[activeSlide];
  const gradientClasses = getGradientBackground(analysis.slides[activeSlide]);

  // Handle sharing functionality
  const handleShare = async () => {
    if (!result || !analysis.slides[activeSlide]) return;

    const currentSlideData = analysis.slides[activeSlide];
    let shareText = "";
    let shareTitle = "";

    // Create share text based on slide content
    if (currentSlideData.content.quote) {
      shareText = `"${currentSlideData.content.quote}"`;
      if (currentSlideData.content.attribution) {
        shareText += ` - ${currentSlideData.content.attribution}`;
      } else if (currentSlideData.type === "lyric_quote") {
        shareText += ` - ${analysis.songInfo.title} by ${analysis.songInfo.artist}`;
      }
    } else {
      shareText = currentSlideData.content.main;
    }

    // Set share title based on slide type
    switch (currentSlideData.type) {
      case "lyric_quote":
        shareTitle = "This song hit different 🎵";
        break;
      case "emotional_reflection":
        shareTitle = "Found some emotional connection 💔";
        break;
      case "quranic_wisdom":
        shareTitle = "Music meets faith 📖";
        break;
      case "hope_message":
        shareTitle = "Found some hope message 🌟";
        break;
      case "spiritual_insight":
        shareTitle = "Spiritual wisdom ✨";
        break;
      case "practical_guidance":
        shareTitle = "Life guidance 🧭";
        break;
      case "personal_story":
        shareTitle = "Heart to heart 💕";
        break;
      default:
        shareTitle = "Spiritual insights ✨";
    }

    if (navigator.share && shareText) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `${shareText}\n\n${shareTitle} - ${window.location.href}`
        );
      }
    } else if (shareText) {
      // Fallback to copying to clipboard
      await navigator.clipboard.writeText(
        `${shareText}\n\n${shareTitle} - ${window.location.href}`
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div
        className={cn(
          "relative h-[80vh] md:h-[70vh] rounded-3xl shadow-2xl transition-all duration-700 overflow-hidden touch-pan-y",
          isSwipeInProgress && "scale-[0.98] shadow-xl"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Beautiful Gradient Background */}
        <div
          className={cn("absolute inset-0 bg-gradient-to-br", gradientClasses)}
        />

        {/* Static Grain Texture Overlay */}
        <div className="absolute inset-0">
          {/* Primary grain */}
          <div
            className="absolute inset-0 opacity-90 mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='primaryGrain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' seed='42' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23primaryGrain)'/%3E%3C/svg%3E")`,
              backgroundSize: "800px 800px",
            }}
          />

          {/* Fine grain layer */}
          <div
            className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fineGrain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.6' numOctaves='2' seed='17' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fineGrain)'/%3E%3C/svg%3E")`,
              backgroundSize: "600px 600px",
            }}
          />
        </div>

        {/* Subtle Depth Overlay */}
        <div className="absolute inset-0">
          {/* Gentle vignette */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at center, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 100%)",
            }}
          />

          {/* Bottom fade for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Floating Navigation - minimal and elegant */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <div className="bg-black/30 backdrop-blur-md rounded-full px-4 py-2">
            <span className="text-sm font-medium text-white">
              {activeSlide + 1} of {slides.length}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-10 w-10 p-0 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Visual Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
          <div
            className="h-full bg-white/60 transition-all duration-500 ease-out"
            style={{ width: `${((activeSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Main Content */}
        {currentSlide.content}

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          <div className="space-y-4">
            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white backdrop-blur-md"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Previous</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))
                }
                disabled={activeSlide === slides.length - 1}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed text-white backdrop-blur-md"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Brand and Dots Row */}
            <div className="flex items-center justify-between border-t border-white/20 pt-4">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Logo size="sm" />
                <span>SuperQuran.com</span>
              </div>

              {/* Minimal slide dots */}
              <div className="flex gap-1">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === activeSlide
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
