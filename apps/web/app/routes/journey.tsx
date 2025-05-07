import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/journey";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";
import { ArrowLeft, ExternalLink, ChevronDown, Globe, MapPin } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Bringing the Quran Closer to You | The Journey" },
    { name: "description", content: "Explore the evolution of Quranic knowledge from oral tradition to AI-powered personalization" },
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
        setCompletion(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
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
    const ref = section === "past" ? pastRef : section === "present" ? presentRef : futureRef;
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
      <header className={cn(
        "fixed left-0 right-0 z-20 transition-all duration-300 backdrop-blur-md border-b border-white/5",
        isHeaderVisible ? "top-0" : "-top-20"
      )}>
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
              <Logo size="sm" className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
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
        {/* Hero section */}
        <section className="px-4 sm:px-6 max-w-3xl mx-auto mb-24 mt-12">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Bringing the <br />
            <span className="text-white">Quran Closer to You</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 max-w-2xl font-light leading-relaxed">
            The journey from oral tradition to AI-powered personalization
          </p>
        </section>

        {/* Past section */}
        <section ref={pastRef} className="px-4 sm:px-6 max-w-3xl mx-auto mb-32" id="past">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 01</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mt-2 tracking-tight">The Past</h2>
            <p className="text-white/60 text-lg mt-2 font-light">(How Knowledge Evolved)</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-2xl font-medium mb-8 leading-relaxed">
              <strong>Remember when knowledge was a journey?</strong>
            </p>

            <p className="leading-relaxed">
              In the 9th century, Imam Bukhari traveled over 1,000 miles across deserts and mountains, from Bukhara to Mecca, Baghdad to Cairo. He journeyed for months, sometimes years, to verify a single hadith. Knowledge required physical movement. Wisdom demanded sacrifice.
            </p>

            <p className="leading-relaxed">
              This was the reality of Islamic scholarship for centuries—a world where accessing divine guidance meant arduous journeys, rare manuscripts, and lifelong dedication.
            </p>

            <p className="leading-relaxed">
              The Quran itself began as pure sound—revelation transmitted through voice, memorized by heart, passed from person to person. When it was first compiled into a standardized written text during Uthman's caliphate, it represented a revolution in accessibility. No longer was the complete Quran confined to the memories of individuals who might perish in battle.
            </p>

            <p className="leading-relaxed">
              Later, when diacritical marks were added—the fathah, dammah, and kasrah—non-Arabs could suddenly read the text correctly. Another barrier fell.
            </p>

            <p className="leading-relaxed">
              Each evolution brought the divine word closer to more people. Each innovation democratized access to wisdom that was once available only to the few.
            </p>

            <p className="leading-relaxed">
              The journey from sound to script, from memory to page, took centuries. But it was just the beginning.
            </p>
          </div>
        </section>

        {/* Present section */}
        <section ref={presentRef} className="px-4 sm:px-6 max-w-3xl mx-auto mb-32" id="present">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 02</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mt-2 tracking-tight">The Present</h2>
            <p className="text-white/60 text-lg mt-2 font-light">(The Status Quo)</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="leading-relaxed">
              We now live in a world of unprecedented access. The Quran exists in our pockets, available with a tap on our screens. What once required a journey across continents now requires only a swipe of a finger.
            </p>

            <p className="leading-relaxed">
              The 1990s brought digital Qurans on disks and CD-ROMs. The internet age gave us online access, searchable texts, and mobile applications. We can listen to any recitation, read any translation, search for any word or phrase.
            </p>

            <p className="text-2xl font-medium my-8 leading-relaxed">
              It sounds like the future our predecessors dreamed of.
              <br />
              <strong>But digital access alone isn't enough.</strong>
            </p>

            <p className="leading-relaxed">
              While the Quran is more accessible than ever, a different kind of distance has emerged—not physical, but contextual. We can access the text, but struggle to connect it to our lives. We can search for words, but not for meaning. We can find verses, but not their application to our unique circumstances.
            </p>

            <p className="leading-relaxed">
              Three barriers stand between us and true accessibility:
            </p>

            <h3 className="text-xl font-medium mt-8 mb-3">Barrier 01: The Knowledge Gap</h3>
            <p className="leading-relaxed">
              Most of us lack the deep scholarly background to fully understand the Quran's context, its historical circumstances, its linguistic nuances. We read translations that capture words but miss layers of meaning. We approach a text from the 7th century with 21st century assumptions.
            </p>

            <h3 className="text-xl font-medium mt-8 mb-3">Barrier 02: The Relevance Gap</h3>
            <p className="leading-relaxed">
              Even when we understand the text, we struggle to apply it. How does a verse about ancient battles guide us through modern challenges? How does divine wisdom about desert communities translate to digital societies? The connection between scripture and daily life remains elusive.
            </p>

            <h3 className="text-xl font-medium mt-8 mb-3">Barrier 03: The Discovery Gap</h3>
            <p className="leading-relaxed">
              We don't know what we don't know. Search engines require us to know what to look for. But how can we search for wisdom we don't know exists? How can we find guidance for situations we've never encountered in the text?
            </p>

            <p className="leading-relaxed">
              While digital innovations continue, the fundamental way we access Quranic wisdom has remained largely unchanged. The Quran is available, but still distant from our daily experiences—a separate activity, a deliberate consultation, disconnected from the flow of our lives.
            </p>

            <p className="text-2xl font-medium my-8 leading-relaxed">
              But not all hope is lost.
              <br />
              <strong>What if we could bridge these gaps together?</strong>
            </p>
          </div>
        </section>

        {/* Future section */}
        <section ref={futureRef} className="px-4 sm:px-6 max-w-3xl mx-auto mb-20" id="future">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-white/80 text-sm font-medium">Part 03</span>
              <div className="h-px w-12 bg-white/20"></div>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold mt-2 tracking-tight">The Future</h2>
            <p className="text-white/60 text-lg mt-2 font-light">(The Revolution You Can Join)</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <p className="leading-relaxed">
              We stand at the threshold of the AI age—a revolution as significant as the transition from oral to written text, from manuscript to print, from physical to digital. For the first time in history, we can create systems that understand not just words, but meaning. Not just text, but context. Not just questions, but the humans asking them.
            </p>

            <p className="leading-relaxed">
              This future is within our collective reach—a knowledge graph that maps the connections between verses, concepts, historical context, and modern application. AI that can understand our unique situations and find the divine wisdom most relevant to our lives.
            </p>

            <p className="text-xl font-medium mt-8 mb-4">
              Imagine:
            </p>

            <div className="space-y-6">
              <p className="leading-relaxed pl-4 border-l-2 border-white/20">
                You just watched a film about overcoming ego, and within moments, you're exploring Quranic wisdom about humility that perfectly complements the film's message.
              </p>

              <p className="leading-relaxed pl-4 border-l-2 border-white/20">
                You're struggling with anxiety while raising two children, and receive guidance tailored to your specific family situation—not generic advice, but wisdom that speaks directly to your circumstances.
              </p>

              <p className="leading-relaxed pl-4 border-l-2 border-white/20">
                You heard a song with lyrics that moved you, and instantly discover its connection to Quranic teachings you never knew existed.
              </p>
            </div>

            <p className="leading-relaxed mt-6">
              This is not just search. It's connection. It's not just information. It's guidance.
            </p>

            <p className="leading-relaxed">
              The Quran will no longer be something you consult—it will be something that accompanies you through life, offering wisdom precisely when and how you need it.
            </p>

            <p className="text-2xl font-medium my-8 leading-relaxed">
              <strong>This is the future you can help build. A future where divine wisdom finds you.</strong>
            </p>

            <p className="leading-relaxed">
              Unlike Imam Bukhari, who traveled thousands of miles alone, you have the opportunity to be part of something larger—a collective effort to transform how humanity accesses divine guidance.
            </p>

            <p className="text-xl font-medium mt-8 mb-4">
              <strong>Your role in this journey matters:</strong>
            </p>

            <div className="space-y-4">
              <p className="leading-relaxed">
                When you share this vision with others, you extend the bridge to those who need it most.
              </p>

              <p className="leading-relaxed">
                When you join the community, you add your voice to shaping how AI connects people with Quranic guidance.
              </p>

              <p className="leading-relaxed">
                When you contribute—whether through feedback, spreading the word, or supporting development—you accelerate the creation of tools that will benefit generations to come.
              </p>
            </div>

            <p className="text-2xl font-medium my-8 leading-relaxed">
              <strong>This is your invitation to the future.</strong>
            </p>

            <p className="leading-relaxed">
              The gap between the Quran and your life has been closing for centuries—from oral to written, from manuscript to print, from physical to digital. Together, we can make this gap even smaller, creating a future where divine wisdom is more accessible to everyone, everywhere, in every circumstance.
            </p>

            <p className="leading-relaxed">
              The choice is yours: continue with the limitations of the present, or help build the bridge to a future where wisdom finds you
            </p>

            <p className="leading-relaxed font-medium text-accent">
              Your chapter in this story begins now.
            </p>
          </div>

          {/* Call to action */}
          <div className="mt-16 flex flex-col sm:flex-row gap-6 items-center justify-center">
            <Button size="lg" className="px-8 py-6 text-base" asChild>
              <a href="https://chat.whatsapp.com/G6i7PnazLRe8qAW5OCGQyh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Join WhatsApp Group
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="lg" className="px-8 py-6 text-base flex items-center gap-2">
                  Sponsor This Project
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px] p-0 bg-black border border-white/10">
                <div className="flex flex-col">
                  <a
                    href="https://buy.polar.sh/polar_cl_g5WynoKOaNuzktUpCuGb6OEqZtw9bV1ZseZ3h2KdLg6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-accent/80" />
                    <div>
                      <div className="font-medium text-sm">Global</div>
                      <div className="text-xs text-white/60">via Polar</div>
                    </div>
                  </a>
                  <div className="h-px w-full bg-white/5"></div>
                  <a
                    href="https://saweria.co/superquran"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-accent/80" />
                    <div>
                      <div className="font-medium text-sm">Indonesia</div>
                      <div className="text-xs text-white/60">via Saweria</div>
                    </div>
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 mt-20">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" className="w-6 h-6" />
            <span className="text-sm font-medium tracking-wide text-white/80">QuranLabs</span>
          </div>
          <div className="text-sm text-white/60 font-light">
            An experimental research project exploring the future of Quranic knowledge
          </div>
        </div>
      </footer>
    </div>
  );
}
