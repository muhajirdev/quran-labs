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
  HeartHandshake,
  Shield,
  Microscope
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

const TAB_ORDER = [
  { id: "temporal", name: "Temporal Loop" },
  { id: "ethical", name: "Ethical Framework" },
  { id: "grief", name: "Impossible Question" },
  { id: "leadership", name: "Hidden Parallel" },
  { id: "science", name: "Scientific Bridge" },
  { id: "verse", name: "Verse Exploration" },
  { id: "daily", name: "Daily Life" },
  { id: "root", name: "Root Word" }
];

function ScenarioPagination({
  activeTab,
  setActiveTab
}: {
  activeTab: string,
  setActiveTab: (val: string) => void
}) {
  const currentIndex = TAB_ORDER.findIndex(t => t.id === activeTab);
  const prevTab = currentIndex > 0 ? TAB_ORDER[currentIndex - 1] : null;
  const nextTab = currentIndex < TAB_ORDER.length - 1 ? TAB_ORDER[currentIndex + 1] : null;

  return (
    <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="w-full sm:w-auto">
        {prevTab ? (
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-white/50 hover:text-white group justify-start px-2"
            onClick={() => setActiveTab(prevTab.id)}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-bold mb-0.5">Previous</span>
              <span className="text-sm">{prevTab.name}</span>
            </div>
          </Button>
        ) : <div className="hidden sm:block w-[140px]"></div>}
      </div>

      <div className="w-full sm:w-auto flex justify-end">
        {nextTab ? (
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-white/50 hover:text-white group justify-end px-2"
            onClick={() => setActiveTab(nextTab.id)}
          >
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-bold mb-0.5">Next Example</span>
              <span className="text-sm">{nextTab.name}</span>
            </div>
            <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : <div className="hidden sm:block w-[140px]"></div>}
      </div>
    </div>
  );
}

export default function JourneyPage() {
  const [activeTab, setActiveTab] = useState<string>("temporal");
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
              The era of text search is over. The era of seeing the full picture begins.
            </p>

            <p className="leading-relaxed mb-4">
              A knowledge graph doesn't just store text; it stores relationships. Every verse connected to its historical context,
              every concept threaded across centuries of scholarship, every Arabic root mapped to its full semantic range.
            </p>
            <p className="leading-relaxed mb-8">
              This isn't a system that tells you what to think. It's a system that lets you <em>see</em> — transparently,
              completely — the vast web of connections that already exists within the Quran and its scholarly tradition.
              No interpretation hidden. No context missing. The full picture, accessible to everyone.
            </p>

            {/* The Imagine Block - Interactive Tabs */}
            <div className="mt-16 mb-20">
              <h3 className="text-2xl font-semibold mb-8 text-white flex items-center gap-3">
                <BrainCircuit className="text-accent w-6 h-6" />
                Imagine a computational foundation where...
              </h3>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/[0.03] border border-white/10 rounded-xl p-1 w-full gap-1 flex overflow-x-auto overflow-y-hidden flex-nowrap justify-start hide-scrollbar snap-x snap-mandatory">
                  <TabsTrigger
                    value="temporal"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span className="inline">Temporal Loop</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="ethical"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Database className="w-4 h-4" />
                    <span className="inline">Ethical Framework</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="grief"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span className="inline">Impossible Question</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="leadership"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="inline">Hidden Parallel</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="science"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Microscope className="w-4 h-4" />
                    <span className="inline">Scientific Bridge</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="verse"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="inline">Verse Exploration</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="daily"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    <span className="inline">Daily Life</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="root"
                    className="shrink-0 snap-start data-[state=active]:bg-accent/15 data-[state=active]:text-accent data-[state=active]:border-accent/30 border border-transparent rounded-lg px-4 py-2.5 text-white/50 hover:text-white/80 text-sm transition-all gap-2"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span className="inline">Root Word</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8 min-h-[320px]">

                  {/* === SCENARIO 1: The Temporal Loop === */}
                  <TabsContent value="temporal">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Temporal Loop</h4>
                      <p className="text-white/40 text-sm mb-5">Family Betrayal → Yusuf → Year of Sorrow — a 3,800-year emotional loop</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"My own brothers destroyed my career out of jealousy."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Emotion → Quranic Parallel</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph identifies the specific emotional signature — <em className="text-white/80">betrayal by blood relatives driven by jealousy</em> — and finds its exact mirror in <strong className="text-white">Surah Yusuf (12:8–18)</strong>, where Yusuf's brothers conspire to throw him into a well.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Father's Response</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Within Surah Yusuf, the graph follows the <em className="text-white/80">responding character</em> — not the victim, but the father. Prophet Yaqub (AS) says: <strong className="text-white">فَصَبْرٌ جَمِيل</strong> — "Beautiful Patience" (12:18). Not passive endurance — dignified composure while his heart was shattering.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Scholarly Precision</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph pulls the classical commentary linked to this exact phrase. Al-Qurtubi's Tafsir defines فَصَبْرٌ جَمِيل: <em className="text-white/80">"Patience without complaining to creation — only to the Creator."</em> Critically, Yaqub didn't suppress his pain. He wept until he <strong className="text-white">lost his eyesight</strong> (12:84). Beautiful patience isn't the absence of grief. It's the <em className="text-white/80">direction</em> of grief.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">Revelation Timing ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">Connected to the surah's revelation metadata, the graph reveals what no search engine can: <strong className="text-white">when</strong> was Surah Yusuf revealed? During the <strong className="text-white">Year of Sorrow (عام الحزن)</strong> — the darkest year of the Prophet ﷺ's life. Khadijah (RA) dies. Abu Talib dies. Ta'if stones him until he bleeds. And <em className="text-white/80">this</em> is the moment Allah chooses to reveal a story about a man betrayed by his own family — who ends up saying: <em className="text-white/80">"No blame on you today"</em> (12:92).</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">You typed 10 words about your brothers. The graph traversed <strong className="text-white">3,800 years</strong> — from Yaqub's tears, to Muhammad ﷺ's darkest hour, to your screen — and revealed: Allah has been answering this exact pain since the beginning of prophethood.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 2: The Ethical Framework === */}
                  <TabsContent value="ethical">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Ethical Framework</h4>
                      <p className="text-white/40 text-sm mb-5">Modern Tech → Quranic Linguistics → Classical Arabic → Islamic Constitutional Law</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"My boss wants me to make our app addictive. Optimize for max screen time. Something feels wrong."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Mechanism Decomposition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph doesn't search for "social media" or "addiction." It decomposes the <em className="text-white/80">mechanism</em> — deliberately engineering heedlessness — and maps it to the Quranic concept of <strong className="text-white">لَهْو</strong> (Lahw). Not "fun." Not "entertainment." Specifically: <em className="text-white/80">deliberate distraction from what matters.</em></p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Quranic Pattern Recognition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Following لَهْو across every occurrence in the Quran, the graph traces it through <strong className="text-white">17 verses</strong>. It surfaces Surah Al-Hadid 57:20 — <em className="text-white/80">"Know that the life of this world is but play and <strong>lahw</strong> and adornment and boasting..."</em> Then cross-references At-Takathur 102:1 — <em className="text-white/80">"The competition for more <strong>distracts you</strong>."</em> The Quran described engagement-maximization algorithms 1,400 years before Silicon Valley.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Classical Linguistic Precision</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph follows the root word to its entry in Lisan al-Arab (13th century), which defines it: <em className="text-white/80">"That which occupies a person away from what is of higher value to them."</em> The word carries <strong className="text-white">intentionality</strong> — the one who <em className="text-white/80">creates</em> Lahw is complicit in the distraction. This isn't "wasting time." This is <em className="text-white/80">engineering</em> the waste of other people's time.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Legal Context ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">Because Lahw's root is tagged under the Maqasid category of <strong className="text-white">حفظ العقل</strong>, the graph leaps from linguistics to <strong className="text-white">Islamic legal philosophy</strong>. It surfaces Al-Shatibi's Maqasid al-Shariah — five inviolable objectives that all of Islamic law exists to protect. The third: <strong className="text-white">حفظ العقل — Protection of the Intellect</strong>. Now the user can see the full picture: their discomfort has a name, a linguistic history, and sits within a centuries-old ethical framework they didn't know existed.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">She didn't get "Islam says don't waste time." She got the <strong className="text-white">full context</strong> — from Quranic text → classical Arabic lexicography → Islamic legal philosophy — allowing her to see her vague discomfort within a 1,200-year intellectual tradition she can now explore, discuss with scholars, and form her own informed understanding.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 3: The Impossible Question === */}
                  <TabsContent value="grief">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Impossible Question</h4>
                      <p className="text-white/40 text-sm mb-5">Child Loss → Prophetic Grief → Theological Safety Net → The Hidden Hadith</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"My baby died. I keep asking why. I'm angry at Allah."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Emotional Triage</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph does NOT immediately search "death of a child." It first identifies the <em className="text-white/80">emotional state</em>: grief combined with <strong className="text-white">anger at God</strong> — the most spiritually dangerous combination. This triggers a traversal path that prioritizes <em className="text-white/80">empathy and validation</em> before theology.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Prophetic Mirror</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Through the 'child loss' node, the graph finds the Prophet ﷺ's own parallel: <strong className="text-white">he himself lost his infant son Ibrahim</strong>. The specific Hadith (Bukhari): he held Ibrahim as he was dying, <em className="text-white/80">wept openly</em>, and said: <em className="text-white/80">"The eyes shed tears, the heart grieves, and we say only what pleases our Lord. Indeed, O Ibrahim, we are saddened by your departure."</em> The Prophet ﷺ modeled that crying is not weakness. Grief is not ingratitude.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Theological Framework</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Linked to the grief node, the graph traverses to the Quran's direct address on loss — <strong className="text-white">Surah Al-Baqarah 2:155–157</strong>: <em className="text-white/80">"We will surely test you with something of fear and hunger and a loss of lives..."</em> — then connects to the commentary that <em className="text-white/80">"those"</em> who are patient receive <strong className="text-white">salawat from their Lord, and mercy</strong> — Allah's direct, personal attention.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Hidden Hadith ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">The patience described in 2:155 connects to a lesser-known hadith about its reward. The graph surfaces what most people have never heard (Sahih Muslim): when a child dies, Allah asks the angels: <em className="text-white/80">"Did you take the soul of My servant's child?"</em> They say yes. <em className="text-white/80">"What did My servant say?"</em> They reply: <em className="text-white/80">"He praised You and said Inna lillahi wa inna ilayhi raji'un."</em> Then Allah says: <strong className="text-white">"Build for My servant a house in Paradise, and name it Bayt al-Hamd (The House of Praise)."</strong></p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">She didn't get a platitude about God's plan. She got the Prophet ﷺ crying over his own son — modeling that her tears are sunnah, not sin. She got Allah personally asking the angels about <em className="text-white/80">her</em> — and building <em className="text-white/80">her</em> a house in Paradise named after her patience.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 4: The Hidden Parallel === */}
                  <TabsContent value="leadership">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Hidden Parallel</h4>
                      <p className="text-white/40 text-sm mb-5">Leadership Crisis → Amanah → Cross-Surah Pattern → Dhul-Qarnayn</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"I had to lay off 40 people today. I feel like I failed them as a leader."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Concept Extraction</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph extracts the core tension: a leader who holds <em className="text-white/80">Amanah</em> (trust/stewardship) over others and feels they've failed that trust. It maps this to <strong className="text-white">Surah Al-Ahzab 33:72</strong> — the trust that even the <em className="text-white/80">heavens and mountains</em> refused to carry.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Prophetic Warning</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Because Amanah is connected to prophetic counsel on leadership, the graph surfaces what the Prophet ﷺ told Abu Dharr (Muslim): <em className="text-white/80">"O Abu Dharr, I see that you are weak. Do not take command over even two people."</em> This isn't criticism — it's the Prophet ﷺ acknowledging that <strong className="text-white">leadership is burden, not privilege</strong>. The guilt this leader feels? It means the Amanah is alive in his heart.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Cross-Surah Pattern</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph follows the 'leadership struggle' theme across multiple prophetic narratives, revealing a pattern invisible when reading linearly: prophets <em className="text-white/80">struggle</em> with leadership. <strong className="text-white">Musa (AS)</strong> asks Allah to send someone else (28:34). <strong className="text-white">Yunus (AS)</strong> walks away entirely (21:87). <strong className="text-white">Nuh (AS)</strong> preaches for 950 years with almost no results (29:14). The Quran doesn't glorify leadership — it sanctifies the <em className="text-white/80">weight</em> of it.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Structural Mirror ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">Following the 'righteous leader' archetype, the graph finds its deepest model: <strong className="text-white">Dhul-Qarnayn</strong> in Surah Al-Kahf (18:83–98). A leader given power <em className="text-white/80">"over all things"</em> who builds infrastructure for vulnerable people — and when it's done, says: <em className="text-white/80">"This is a mercy from my Lord."</em> He attributes success to Allah, not himself. The Quranic model: build with excellence, accept that all structures are temporary — your job was to carry the Amanah faithfully, not to guarantee permanence.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">He didn't get "trust Allah's plan." He got a complete Quranic theology of leadership — his guilt <em className="text-white/80">proves</em> his faith, even prophets struggled with the weight, and the measure of a leader isn't permanence but faithfulness to the trust.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 5: The Scientific Bridge === */}
                  <TabsContent value="science">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">The Scientific Bridge</h4>
                      <p className="text-white/40 text-sm mb-5">Faith Doubt → Shubha Validation → Ibn Rushd → Linguistic Analysis</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"I studied biology in university and now I'm not sure I believe anymore. Evolution makes more sense to me than creation."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Doubt Classification</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph doesn't flag this as heresy. It classifies the state as <strong className="text-white">Shubha (شبهة)</strong> — genuine intellectual doubt, which Islamic tradition distinguishes from <em className="text-white/80">Shakk</em> (willful rejection). When Companions came to the Prophet ﷺ disturbed by intrusive doubts, he said: <strong className="text-white">"That is pure faith"</strong> (Muslim) — because only a living faith can feel threatened.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Quranic Invitation</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Because the Shubha node is linked to Quranic verses on empirical observation, the graph surfaces something remarkable: the Quran <em className="text-white/80">invites</em> empirical observation. <strong className="text-white">Surah Al-Ghashiyah 88:17–20</strong> — <em className="text-white/80">"Do they not look at the camels, how they are created? And at the sky, how it is raised?"</em> — uses the exact verb <strong className="text-white">أَفَلَا يَنظُرُونَ</strong> ("do they not <em>investigate</em>"). The Quran doesn't say "just believe." It says "look harder."</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Scholarly Tradition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Through the 'faith and reason' concept node, the graph surfaces the scholarly tradition: <strong className="text-white">Ibn Rushd</strong> (Averroes), the 12th-century polymath, wrote in his <em className="text-white/80">Fasl al-Maqal</em>: <em className="text-white/80">"If philosophy leads to conclusions that agree with Scripture, revelation confirms reason. If they appear to conflict, Scripture must be interpreted."</em> The graph surfaces this — not as a ruling, but as historical context: <strong className="text-white">one of Islam's greatest minds already navigated this exact tension 800 years ago.</strong></p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Structural Insight ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">From the creation narrative, the graph examines the specific Arabic used: the Quran rarely gives <em className="text-white/80">mechanisms</em> of creation — it gives <em className="text-white/80">meanings</em>. <strong className="text-white">Surah At-Tin 95:4</strong> — <em className="text-white/80">"We created the human being in the best of forms"</em> — uses the word <strong className="text-white">تقويم</strong> (Taqwim), which classically means "to bring to its most complete, balanced state" — a word about <em className="text-white/80">destination and purpose</em>, not method. Evolution describes <em>how</em>. The Quran describes <em>why</em>.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">She didn't get "just have faith." She got the <strong className="text-white">full picture</strong>: the Prophet ﷺ validating her doubt as a sign of <em className="text-white/80">living faith</em>, the Quran commanding empirical observation, a 12th-century scholarly precedent showing this tension is not new, and a precise linguistic analysis showing the perceived "conflict" may actually be a category error — they're answering different questions entirely.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 6: Verse Exploration === */}
                  <TabsContent value="verse">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">Verse Exploration</h4>
                      <p className="text-white/40 text-sm mb-5">Not an input — you're simply reading Al-Fatiha and tap on a phrase</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Trigger</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">You're reading Surah Al-Fatiha — the prayer you recite <strong className="text-white/80">17 times daily</strong> — and you tap on: <strong className="text-white font-arabic text-lg">اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ</strong> <em className="text-white/80">("Guide us to the straight path")</em></p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Linguistic Origin</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph isolates <strong className="text-white">الصِّرَاط</strong> (As-Sirat). It reveals something most people never learn: this word is borrowed from Latin <em className="text-white/80">"strata"</em> (paved road) — one of the Quran's rare loanwords, showing Allah chose language His audience already understood. You've said this word hundreds of thousands of times without knowing its linguistic ancestry.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Cross-Quranic Word Map</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Following every occurrence of this word across the Quran, the graph traces "Sirat" across <strong className="text-white">45 occurrences</strong> — revealing it's always <em className="text-white/80">singular</em> (THE path, never "paths"), always paired with "Mustaqeem." Then it contrasts with <strong className="text-white">Surah Al-An'am 6:153</strong>: <em className="text-white/80">"This is My path, straight, so follow it; and do not follow other <strong>subul</strong> (side roads)."</em> Two different Arabic words — Sirat (the highway) vs. Subul (branching paths). The Quran embeds theology in its vocabulary.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Structural Analysis</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Connected to the surah's structural analysis, the graph surfaces what scholars call the <strong className="text-white">"Fatiha Framework."</strong> Verses 1–4 are about Allah (praise, attributes, sovereignty). Verses 5–7 are about <em className="text-white/80">us</em> (request, guidance, community). And <em className="text-white/80">this</em> verse — اهدنا — is the exact hinge point. The prayer's architecture moves from knowing God → to asking God → to walking with God.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Obligatory Du'a ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">Linked to this verse's scholarly commentary, the graph finds Ibn Kathir's classification: <strong className="text-white">the most important du'a in the entire Quran</strong>. Why? It's the <em className="text-white/80">only</em> supplication Allah made obligatory — not once, not occasionally, but in <strong className="text-white">every single rak'ah of every prayer</strong>. Allah wanted <em className="text-white/80">this specific request</em> on your lips 17 times a day — over <strong className="text-white">6,200 times a year</strong>. No other du'a in the Quran was given this status.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">No input. No question. You were just reading the most familiar words you've ever spoken — maybe <strong className="text-white">300,000+ times</strong> in your life — and the graph just revealed linguistic, structural, and theological layers you never knew existed in a phrase you thought you already understood.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 7: Daily Life === */}
                  <TabsContent value="daily">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">Daily Life</h4>
                      <p className="text-white/40 text-sm mb-5">Gossip → Quranic Metaphor Deconstruction → Prophetic Definition → Active Remedy</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Input</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1 italic">"I keep gossiping about my coworker. I know it's wrong but I can't stop."</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Precise Classification</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph doesn't just label it "haram" and stop. It distinguishes between three different Arabic terms: <strong className="text-white">Gheebah</strong> (غيبة — backbiting), <strong className="text-white">Nameemah</strong> (نميمة — tale-carrying), and <strong className="text-white">Buhtan</strong> (بهتان — slander). Three different concepts, three different severities. Most people conflate them all as "gossip" — the graph shows you the full taxonomy.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Quranic Metaphor — Deconstructed</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Because Gheebah is directly referenced in the Quran, the graph pulls the primary verse: <strong className="text-white">Surah Al-Hujurat 49:12</strong> — <em className="text-white/80">"Would one of you like to eat the flesh of his dead brother?"</em> The graph pulls classical commentary showing this isn't random hyperbole: <strong className="text-white">"dead"</strong> because the person can't defend themselves. <strong className="text-white">"Brother"</strong> because it violates the bond of ummah. <strong className="text-white">"Flesh"</strong> because you are consuming their honor. Every word is precise.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">The Prophetic Definition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Connected to this verse's hadith commentary, the graph surfaces the Prophet ﷺ's definition (Abu Dawud): <em className="text-white/80">"Gheebah is mentioning your brother with what he dislikes."</em> A companion asked: <em className="text-white/80">"What if what I say is true?"</em> The Prophet ﷺ said: <strong className="text-white">"If it is true, that IS gheebah. If it is false, that is buhtan (slander)."</strong> Truth doesn't make it permissible. Truth is what <em className="text-white/80">makes</em> it gheebah.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Broader Context ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">From the Gheebah node, the graph follows the 'remedy' edge. It doesn't stop at showing the problem, but surfaces the broader context — including the Prophet ﷺ's own words (Ahmad): <strong className="text-white">"Whoever defends the honor of his brother in his absence, Allah will shield his face from the Fire on the Day of Judgment."</strong> The full picture emerges: the tradition doesn't just describe what's wrong — it maps a complete path from the concept, to its weight, to how others before you have navigated it.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">She didn't get a one-word ruling. She got the <strong className="text-white">complete picture</strong>: a precise taxonomy of three different concepts, the most psychologically powerful metaphor in the Quran deconstructed word by word, a Prophetic definition that reframes the "but it's true" assumption, and the broader tradition's full response — giving her the context to truly understand, not just comply.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                  {/* === SCENARIO 8: Root Word Exploration === */}
                  <TabsContent value="root">
                    <div className="border-l-2 border-accent/40 pl-6">
                      <h4 className="text-xl font-medium text-white/90 mb-2">Root Word Exploration</h4>
                      <p className="text-white/40 text-sm mb-5">One Arabic Root → Physical Body → Divine Attribute → Prophetic Revelation</p>
                      <div className="space-y-4">
                        <div>
                          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">The Trigger</span>
                          <p className="text-white/60 text-base leading-relaxed mt-1">You tap on the root <strong className="text-white font-mono text-lg">ر-ح-م</strong> (R-Ḥ-M) while reading <strong className="text-white/80">بسم الله الرحمن الرحيم</strong> — the phrase you say before everything.</p>
                        </div>
                      </div>

                      {/* Hop-by-Hop Traversal */}
                      <div className="mt-6 pt-5 border-t border-white/5 space-y-4">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-wider">The Graph Traversal</span>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Root Decomposition</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">The graph decomposes <strong className="text-white">ر-ح-م</strong> and maps every word derived from it. The first result isn't a divine attribute — it's <strong className="text-white">رَحِم</strong> (Raḥim) — the <em className="text-white/80">womb</em>. The physical organ where life is nurtured in total darkness, without the child asking. Before this root became a name of God, it was a description of <em className="text-white/80">the most intimate, unconditional, all-encompassing human love.</em></p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Morphological Expansion</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Following the morphological derivation edge, two divine names emerge from this root: <strong className="text-white">الرَحْمَن</strong> (Ar-Raḥmān) — the <em className="text-white/80">fa'āl</em> form, meaning overwhelming, explosive mercy that encompasses everything. <strong className="text-white">الرَحِيم</strong> (Ar-Raḥīm) — the <em className="text-white/80">fa'īl</em> form, meaning continuous, sustained, personal mercy. The graph shows these aren't synonyms — they are two <em className="text-white/80">structurally different</em> Arabic patterns describing two <em className="text-white/80">different dimensions</em> of the same love.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/20 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                          <div>
                            <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Cross-Quranic Frequency</span>
                            <p className="text-white/70 text-sm leading-relaxed mt-0.5">Mapping every occurrence of this root across the Quran, the graph finds <strong className="text-white">326 occurrences</strong>. It appears in the Bismillah before every surah except one (At-Tawbah). It's the single most repeated <em className="text-white/80">attribute</em> of Allah in the entire Quran — more than His power, His knowledge, or His wrath. The Quran's statistical emphasis is overwhelmingly on mercy.</p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <span className="bg-accent/30 text-accent text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-accent/40">4</span>
                          <div>
                            <span className="text-accent/70 text-xs font-bold uppercase tracking-wider">The Prophetic Connection ✦</span>
                            <p className="text-white/80 text-sm leading-relaxed mt-0.5">Through the 'Raḥim' (womb) node, the graph surfaces the hadith that explicitly links them (Bukhari): The Prophet ﷺ said: <strong className="text-white">"Allah derived Ar-Raḥmān from Ar-Raḥim (the womb). So whoever maintains the ties of the womb, Allah maintains connection with them."</strong> Allah <em className="text-white/80">Himself</em> tells us His mercy is modeled on a mother's womb. The Arabic language doesn't just describe God — it encodes a theological truth in its very root system: divine mercy and a mother's love share the same origin.</p>
                          </div>
                        </div>

                        <div className="mt-4 bg-accent/5 border border-accent/10 rounded-xl p-4">
                          <span className="text-accent/60 text-xs font-bold uppercase tracking-wider">The Result</span>
                          <p className="text-white/80 text-sm leading-relaxed mt-1">You tapped on three letters — ر ح م — and the graph revealed that the phrase you say before every meal, every prayer, every action contains a <strong className="text-white">linguistic equation</strong>: God's mercy = the womb's love. <strong className="text-white">326 verses</strong>, one Prophetic hadith, and the entire Arabic morphological system unified in a single root.</p>
                        </div>
                      </div>

                      <ScenarioPagination activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                  </TabsContent>

                </div>
              </Tabs>
            </div>

            {/* Prominent Callout Block for Quranic AI Foundation */}
            <div className="my-16 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent border border-accent/20 p-8 sm:p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/30 blur-3xl rounded-full mix-blend-screen pointer-events-none"></div>
              <Database className="w-10 h-10 text-accent mb-4 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">
                But to build this, we don't just need data—we need <em>connected</em> data.
              </h3>
              <p className="text-white/80 text-base leading-relaxed relative z-10 mb-4">
                Verses linked to their historical context. Concepts threaded across Tafsir, Fiqh, and Seerah. Arabic roots mapped to every usage. <strong>This is the Quranic AI Foundation</strong>—a deeply interconnected knowledge graph that becomes the bedrock for every interaction above.
              </p>
              <p className="text-white/60 text-sm leading-relaxed relative z-10">
                Crucially, this system does not interpret or give fatwas. It makes connections <em>visible</em> — surfacing the full scholarly context so that you, your teacher, or your community can see the complete picture and draw informed understanding. Transparency is the foundation.
              </p>
            </div>

            <div className="text-center mt-12 mb-16 px-4">
              <p className="text-2xl text-white font-medium mb-2">
                Not a scholar in a box. A lens for seeing deeper.
              </p>
              <p className="text-white/50">
                The full context of the Quran's tradition — accessible, transparent, and always traceable back to its sources.
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
        </section >
      </main >

      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 mt-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <Logo size="sm" className="w-6 h-6" />
              <span className="text-sm font-medium tracking-wide text-white/80">
                SuperQuran Graph
              </span>
            </div>
            <a
              href="https://github.com/muhajirdev/quran-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-1.5"
            >
              GitHub (Open Source)
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="text-sm text-white/60 font-light text-center sm:text-right">
            An experimental research project exploring the future of Quranic
            knowledge
          </div>
        </div>
      </footer>
    </div >
  );
}
