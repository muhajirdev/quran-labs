import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/journey";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Compass,
  Search,
  Database,
  BrainCircuit,
  HeartHandshake
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "~/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Bringing the Quran Closer to You | The Journey" },
    {
      name: "description",
      content:
        "Explore the evolution of Quranic knowledge from oral tradition to AI-powered personalization",
    },
  ];
}

// Custom hook for tracking reading progress
function useReadingProgress() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    function updateScrollCompletion() {
      // Calculate how much the user has scrolled through the page
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setCompletion(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    }

    // Add scroll event listener
    window.addEventListener("scroll", updateScrollCompletion);

    // Call once to set initial value
    updateScrollCompletion();

    // Clean up
    return () => window.removeEventListener("scroll", updateScrollCompletion);
  }, []);

  return completion;
}

export default function JourneyPage() {
  const [activeSection, setActiveSection] = useState<string>("past");
  const pastRef = useRef<HTMLDivElement>(null);
  const presentRef = useRef<HTMLDivElement>(null);
  const futureRef = useRef<HTMLDivElement>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const lastHeaderChangeTime = useRef(Date.now());
  const headerChangeThreshold = 200; // ms
  const completion = useReadingProgress();

  // Handle scroll events for header visibility and section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const isScrollingDown = currentScrollY > lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Update active section based on scroll position
      if (pastRef.current && presentRef.current && futureRef.current) {
        const presentTop = presentRef.current.getBoundingClientRect().top;
        const futureTop = futureRef.current.getBoundingClientRect().top;

        if (futureTop < window.innerHeight / 2) {
          setActiveSection("future");
        } else if (presentTop < window.innerHeight / 2) {
          setActiveSection("present");
        } else {
          setActiveSection("past");
        }
      }

      // Handle header visibility
      if (currentTime - lastHeaderChangeTime.current > headerChangeThreshold) {
        if (isScrollingDown && currentScrollY > 100) {
          if (isHeaderVisible) {
            setIsHeaderVisible(false);
            lastHeaderChangeTime.current = currentTime;
          }
        } else if (!isScrollingDown) {
          if (!isHeaderVisible) {
            setIsHeaderVisible(true);
            lastHeaderChangeTime.current = currentTime;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeaderVisible]);

  // Scroll to section when navigation is clicked
  const scrollToSection = (section: string) => {
    const ref =
      section === "past"
        ? pastRef
        : section === "present"
          ? presentRef
          : futureRef;
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Decorative background */}
      <GeometricDecoration variant="animated" opacity={0.6} />
      {/* Gradient overlay fixed */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-black/40 z-0" />

      {/* Header */}
      <header
        className={cn(
          "fixed left-0 right-0 z-20 transition-all duration-300 backdrop-blur-md border-b border-white/5",
          isHeaderVisible ? "top-0" : "-top-20"
        )}
      >
        {/* Reading progress indicator */}
        <div
          className="h-[2px] bg-white/30 transition-all duration-300 ease-in-out"
          style={{ width: `${completion}%` }}
          aria-hidden="true"
        />

        <div className="flex items-center justify-between py-4 px-4 sm:px-6 relative z-10">
          {/* Logo and back button */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/5"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link to="/" className="flex items-center gap-2 group">
              <Logo
                size="sm"
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="font-medium tracking-wide">Journey</span>
            </Link>
          </div>

          {/* Section navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("past")}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:text-white",
                activeSection === "past" ? "text-white" : "text-white/50"
              )}
            >
              01. The Past
            </button>
            <button
              onClick={() => scrollToSection("present")}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:text-white",
                activeSection === "present" ? "text-white" : "text-white/50"
              )}
            >
              02. The Present
            </button>
            <button
              onClick={() => scrollToSection("future")}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-300 hover:text-white",
                activeSection === "future" ? "text-white" : "text-white/50"
              )}
            >
              03. The Future
            </button>
          </nav>

          {/* CTA */}
          <div className="hidden sm:block">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Try Now</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 relative z-10">

        {/* === HERO SECTION === */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-32 mt-12 text-center md:text-left">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Bringing the <br className="hidden md:block" />
            <span className="text-white">Quran Closer to You</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 max-w-2xl font-light leading-relaxed">
            The journey from ancient manuscript to AI-powered connection.
          </p>
        </section>

        {/* === PART 1: THE PAST === */}
        <section ref={pastRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-32" id="past">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 01</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">The Past</h2>
            <p className="text-white/50 text-xl font-light mt-1">Movement and Sacrifice.</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-white/80">
            <p className="text-2xl font-medium mb-6 text-white leading-snug">
              In the 9th century, Imam Bukhari traveled over 1,000 miles to verify a single hadith.
            </p>
            <p className="leading-relaxed">
              Knowledge was a physical journey. The Quran itself began as pure sound, memorized by heart,
              passed person to person over deserts and mountains. When it was compiled into written text,
              and later when diacritical marks were added, it broke down monumental barriers.
            </p>
            <p className="leading-relaxed font-medium mt-6">
              Each evolution democratized access to the divine word. But the journey was far from over.
            </p>
          </div>
        </section>

        {/* === PART 2: THE PRESENT === */}
        <section ref={presentRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-32" id="present">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 02</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">The Present</h2>
            <p className="text-white/50 text-xl font-light mt-1">Access vs. Connection.</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-white/80 mb-12">
            <p className="leading-relaxed">
              Today, the Quran is in our pockets. We have unprecedented access, yet a new, invisible distance remains.
              We can search for words, but we struggle to find meaning.
            </p>
            <p className="text-2xl text-white font-medium my-8 leading-snug">
              We live in an age of information abundance, but profound spiritual malnutrition. Three critical barriers stand between us and true connection:
            </p>
          </div>

          {/* Clean 3-Column UI for Barriers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] transition-colors">
              <BookOpen className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Scattered Scholarship</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Centuries of brilliant Tafsir, linguistic analysis, and context exist, but they are scattered across disconnected texts and languages. The wisdom is there, but it's siloed.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] transition-colors">
              <Compass className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Lost Context</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                We read verses in isolation. Without seeing the intricate web of connections—like how a concept weaves through different stories and rulings—the deeper meaning is lost.
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] transition-colors">
              <Search className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Rigid Search</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Modern tools only match keywords; they don't understand the human condition. Searching for "sadness" won't find the nuanced psychological comfort embedded in the story of Yaqub (AS).
              </p>
            </div>
          </div>
        </section>

        {/* === PART 3: THE FUTURE === */}
        <section ref={futureRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-20" id="future">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 03</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">The Future</h2>
            <p className="text-white/50 text-xl font-light mt-1">A Knowledge Graph Revolution.</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-white/80">
            <p className="text-3xl text-white font-medium mb-8 leading-snug">
              The era of text search is over. The era of connected understanding begins.
            </p>

            <p className="leading-relaxed mb-8">
              A graph doesn't just store text; it stores relationships. This is the promise of the AI age:
              a vibrant network connecting verses, historical contexts, and modern-day emotions. An AI that bridges the 1,400-year gap
              instantly, finding divine wisdom perfectly tailored to the exact moment you are living.
            </p>

            {/* The Imagine Block - Interactive Tabs */}
            <div className="mt-16 mb-20">
              <h3 className="text-2xl font-semibold mb-8 text-white flex items-center gap-3">
                <BrainCircuit className="text-accent w-6 h-6" />
                Imagine a computational foundation where...
              </h3>

              <Tabs defaultValue="parenting" className="w-full">
                <TabsList className="bg-white/[0.03] border border-white/10 rounded-xl p-1 h-auto flex-wrap w-full gap-1">
                  <TabsTrigger
                    value="parenting"
                    className="data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span className="hidden sm:inline">The Parent</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="commerce"
                    className="data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="hidden sm:inline">The Professional</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comfort"
                    className="data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span className="hidden sm:inline">The Seeker</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="linguistics"
                    className="data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">The Student</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 min-h-[320px]">
                  <TabsContent value="parenting">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-5">The Modern Parent</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Struggle</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">A mother is exhausted, feeling like a failure because her child is struggling with focus in a hyper-digital world.</p>
                        </div>
                        <div>
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Graph Magic</span>
                          <p className="text-white/80 text-base leading-relaxed mt-1">The system doesn't just say "be patient." It connects her immediate emotional state to the specific pedagogical approach the Prophet (ﷺ) used with Anas bin Malik (RA) as a child, threads it to Imam Al-Ghazali's writings on raising children, and outputs practical, psychologically sound advice grounded in centuries of Islamic tradition.</p>
                        </div>
                      </div>
                      {/* Graph Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">How the Graph Connects It</span>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">"child struggling"</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">concept</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Tarbiyah (تربية)</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">hadith</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Prophet ﷺ with Anas (RA)</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">discussed_in</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Ihya Ulum al-Din, Book on Children</span>
                        </div>
                        <p className="text-white/30 text-xs mt-3 italic">9 entities traversed · 8 relationships · spans 1,400 years of scholarship</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="commerce">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-5">The Ethical Professional</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Struggle</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">A software engineer is asked to build an algorithm that might unintentionally discriminate, or a businessman is navigating a complex new financial derivative (like crypto staking).</p>
                        </div>
                        <div>
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Graph Magic</span>
                          <p className="text-white/80 text-base leading-relaxed mt-1">Standard search yields generic "Haram/Halal" fatwas. The Knowledge Graph traces the underlying principle (e.g., <em>Gharar</em> — uncertainty, or <em>Dharar</em> — harm) from its Quranic root, through the historical debates of the four Madhahib, directly into modern economic and tech ethics, providing a nuanced, historically anchored framework for their exact situation.</p>
                        </div>
                      </div>
                      {/* Graph Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">How the Graph Connects It</span>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">"crypto staking"</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">principle</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Gharar (غرر)</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">root_verse</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Surah Al-Baqarah 2:275</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">madhab_debate</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Hanafi · Shafi'i · Hanbali · Maliki</span>
                        </div>
                        <p className="text-white/30 text-xs mt-3 italic">12 entities traversed · 11 relationships · bridges Quran, 4 Madhahib, and modern fintech</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comfort">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Emotional & Historical Loop</h4>
                      <p className="text-white/40 text-sm mb-5">Story of Yusuf & The Seerah</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Modern Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">A user feels profound betrayal by family members.</p>
                        </div>
                      </div>
                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Concept Mapping</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph maps this emotion to the Story of Prophet Yusuf (AS) and his brothers.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Specific Entity</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">It highlights the exact reaction of Prophet Yaqub (AS): <strong className="text-white/90">"Sabrun Jameel"</strong> (Beautiful Patience).</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Scholarly Definition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">It pulls the definition from classical Tafsir: <em className="text-white/80">"Patience without complaining to anyone but Allah."</em></p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Seerah Connection ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">This is where it gets profound. The graph knows <em>when</em> Surah Yusuf was revealed. It maps this story directly to the <strong className="text-white">Year of Sorrow (Aam al-Huzn)</strong>, showing that Allah revealed this specific story of family betrayal and loss to Prophet Muhammad (ﷺ) in the exact year he lost his greatest family support (Khadijah and Abu Talib) and was ostracized by his tribe.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">The user doesn't just get a verse about patience. They get a deeply woven narrative showing how a <strong className="text-white">3,000-year-old story</strong> was used by Allah to comfort the Prophet (ﷺ) <strong className="text-white">1,400 years ago</strong>, tailored exactly to their current emotional state <strong className="text-white">today</strong>.</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="linguistics">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-5">The Lifelong Student</h4>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Struggle</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">A student is confused by the translation of a specific word in the Quran, feeling like the English word lacks depth.</p>
                        </div>
                        <div>
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Graph Magic</span>
                          <p className="text-white/80 text-base leading-relaxed mt-1">They select a single Arabic root word. Instantly, a visual web expands: showing how that precise root was used in pre-Islamic poetry, how its meaning shifts across 40 different verses, how classical lexicographers (like Ibn Manzur) defined it, and how it impacts a specific ruling in jurisprudence.</p>
                        </div>
                      </div>
                      {/* Graph Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">How the Graph Connects It</span>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Root: ر-ح-م</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">pre_islamic</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Imru' al-Qays poetry</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">quranic_usage</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">40+ verses</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-white/[0.05] text-white/50 px-2.5 py-1 rounded-md font-mono">lexicon</span>
                          <span className="text-white/20">→</span>
                          <span className="bg-accent/10 text-accent/80 px-2.5 py-1 rounded-md font-mono">Lisan al-Arab (Ibn Manzur)</span>
                        </div>
                        <p className="text-white/30 text-xs mt-3 italic">14 entities traversed · 40+ verses connected · poetry, Quran, lexicography, and Fiqh unified</p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Prominent Callout Block for Ummatic AI Foundation */}
            <div className="my-16 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8 sm:p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/30 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
              <Database className="w-10 h-10 text-accent mb-4 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                But to build this, we don't just need data—we need <em>connected</em> data.
              </h3>
              <p className="text-white/80 text-base leading-relaxed relative z-10">
                Verses linked to their historical context. Concepts threaded across Tafsir, Fiqh, and Seerah. Arabic roots mapped to every usage. <strong>This is the Ummatic AI Foundation</strong>—a deeply interconnected knowledge graph that becomes the bedrock for every AI interaction above.
              </p>
            </div>

            <div className="text-center mt-12 mb-16 px-4">
              <p className="text-2xl text-white font-medium mb-2">
                This isn't just search. It's direct connection.
              </p>
              <p className="text-white/50">
                The Quran accompanying you through life, precise and present.
              </p>
            </div>
          </div>

          {/* Simple CTA */}
          <div className="mt-20 border-t border-white/10 pt-20">
            <div className="flex flex-col items-center justify-center text-center">
              <h3 className="text-3xl font-bold mb-8">Help build the bridge.</h3>
              <Button
                size="lg"
                className="px-10 py-7 text-lg bg-white text-black hover:bg-white/90 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all font-medium"
                asChild
              >
                <a
                  href="mailto:muhammad@muhajir.dev"
                  className="flex items-center gap-3"
                >
                  Get in Touch
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
              <p className="mt-6 text-white/50 text-sm max-w-md leading-relaxed">
                Whether you're developing, sponsoring, or just brainstorming—send an email.
                Together, we'll shape the future of Quranic AI.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 mt-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" className="w-6 h-6" />
            <span className="text-sm font-medium tracking-wide text-white/80">
              QuranLabs
            </span>
          </div>
          <div className="text-sm text-white/60 font-light">
            An experimental research project exploring the future of Quranic
            knowledge
          </div>
        </div>
      </footer>
    </div>
  );
}
