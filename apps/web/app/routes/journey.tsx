import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/journey";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";
import { ArrowLeft, ExternalLink } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "The Journey | Democratizing Access to Quranic Wisdom" },
    { name: "description", content: "Explore the evolution of Quranic knowledge from oral tradition to AI-powered personalization" },
  ];
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

  // Handle scroll events for header visibility and section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const isScrollingDown = currentScrollY > lastScrollY.current;
      lastScrollY.current = currentScrollY;

      // Update active section based on scroll position
      if (pastRef.current && presentRef.current && futureRef.current) {
        const pastTop = pastRef.current.getBoundingClientRect().top;
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
      <GeometricDecoration variant="animated" opacity={0.7} />

      {/* Header */}
      <header className={cn(
        "fixed left-0 right-0 z-10 transition-all duration-300 backdrop-blur-md border-b border-white/5",
        isHeaderVisible ? "top-0" : "-top-20"
      )}>
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
              <span className="font-medium tracking-wide">QuranLabs</span>
            </Link>
          </div>

          {/* Section navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("past")}
              className={cn(
                "text-sm transition-colors duration-300 hover:text-accent",
                activeSection === "past" ? "text-accent" : "text-white/70"
              )}
            >
              01. The Past
            </button>
            <button
              onClick={() => scrollToSection("present")}
              className={cn(
                "text-sm transition-colors duration-300 hover:text-accent",
                activeSection === "present" ? "text-accent" : "text-white/70"
              )}
            >
              02. The Present
            </button>
            <button
              onClick={() => scrollToSection("future")}
              className={cn(
                "text-sm transition-colors duration-300 hover:text-accent",
                activeSection === "future" ? "text-accent" : "text-white/70"
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
      <main className="pt-24 pb-20">
        {/* Hero section */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-24 mt-12">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8">
            Democratizing <br />
            Quranic Wisdom
          </h1>
          <p className="text-xl sm:text-2xl text-white/70 max-w-2xl">
            The journey from oral tradition to AI-powered personalization
          </p>
        </section>

        {/* Past section */}
        <section ref={pastRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-32" id="past">
          <div className="mb-8">
            <span className="text-accent text-sm font-medium">Part 01</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">The Past</h2>
            <p className="text-white/50 text-sm mt-1">(How Knowledge Evolved)</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-xl font-medium mb-6">
              <strong>Remember when knowledge was a journey?</strong>
            </p>

            <p>
              In the 9th century, Imam Bukhari traveled over 1,000 miles across deserts and mountains, from Bukhara to Mecca, Baghdad to Cairo. He journeyed for months, sometimes years, to verify a single hadith. Knowledge required physical movement. Wisdom demanded sacrifice.
            </p>

            <p>
              This was the reality of Islamic scholarship for centuries—a world where accessing divine guidance meant arduous journeys, rare manuscripts, and lifelong dedication.
            </p>

            <p>
              The Quran itself began as pure sound—revelation transmitted through voice, memorized by heart, passed from person to person. When it was first compiled into a standardized written text during Uthman's caliphate, it represented a revolution in accessibility. No longer was the complete Quran confined to the memories of individuals who might perish in battle.
            </p>

            <p>
              Later, when diacritical marks were added—the fathah, dammah, and kasrah—non-Arabs could suddenly read the text correctly. Another barrier fell.
            </p>

            <p>
              Each evolution brought the divine word closer to more people. Each innovation democratized access to wisdom that was once available only to the few.
            </p>

            <p>
              The journey from sound to script, from memory to page, took centuries. But it was just the beginning.
            </p>
          </div>
        </section>

        {/* Present section */}
        <section ref={presentRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-32" id="present">
          <div className="mb-8">
            <span className="text-accent text-sm font-medium">Part 02</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">The Present</h2>
            <p className="text-white/50 text-sm mt-1">(Where We Stand Together)</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p>
              We now live in a world of unprecedented access. The Quran exists in our pockets, available with a tap on our screens. What once required a journey across continents now requires only a swipe of a finger.
            </p>

            <p>
              The 1990s brought digital Qurans on disks and CD-ROMs. The internet age gave us online access, searchable texts, and mobile applications. We can listen to any recitation, read any translation, search for any word or phrase.
            </p>

            <p className="text-xl font-medium my-6">
              It sounds like the future our predecessors dreamed of.
              <br />
              <strong>But it's not the future we truly need.</strong>
            </p>

            <p>
              While the Quran is more accessible than ever, a different kind of distance has emerged—not physical, but contextual. We can access the text, but struggle to connect it to our lives. We can search for words, but not for meaning. We can find verses, but not their application to our unique circumstances.
            </p>

            <p>
              Three barriers stand between us and true accessibility:
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">Barrier 01: The Knowledge Gap</h3>
            <p>
              Most of us lack the deep scholarly background to fully understand the Quran's context, its historical circumstances, its linguistic nuances. We read translations that capture words but miss layers of meaning. We approach a text from the 7th century with 21st century assumptions.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">Barrier 02: The Relevance Gap</h3>
            <p>
              Even when we understand the text, we struggle to apply it. How does a verse about ancient battles guide us through modern challenges? How does divine wisdom about desert communities translate to digital societies? The connection between scripture and daily life remains elusive.
            </p>

            <h3 className="text-lg font-medium mt-6 mb-2">Barrier 03: The Discovery Gap</h3>
            <p>
              We don't know what we don't know. Search engines require us to know what to look for. But how can we search for wisdom we don't know exists? How can we find guidance for situations we've never encountered in the text?
            </p>

            <p>
              For nearly two decades, innovation has plateaued. The Quran is available, but still distant from our daily experiences—a separate activity, a deliberate consultation, disconnected from the flow of our lives.
            </p>

            <p className="text-xl font-medium my-6">
              But not all hope is lost.
              <br />
              <strong>What if we could bridge these gaps together?</strong>
            </p>
          </div>
        </section>

        {/* Future section */}
        <section ref={futureRef} className="px-4 sm:px-6 max-w-4xl mx-auto mb-20" id="future">
          <div className="mb-8">
            <span className="text-accent text-sm font-medium">Part 03</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">The Future</h2>
            <p className="text-white/50 text-sm mt-1">(The Revolution You Can Join)</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p>
              We stand at the threshold of the AI age—a revolution as significant as the transition from oral to written text, from manuscript to print, from physical to digital. For the first time in history, we can create systems that understand not just words, but meaning. Not just text, but context. Not just questions, but the humans asking them.
            </p>

            <p>
              This future is within our collective reach—a knowledge graph that maps the connections between verses, concepts, historical context, and modern application. AI that can understand our unique situations and find the divine wisdom most relevant to our lives.
            </p>

            <p>
              Imagine:
            </p>

            <p>
              You just watched a film about overcoming ego, and within moments, you're exploring Quranic wisdom about humility that perfectly complements the film's message.
            </p>

            <p>
              You're struggling with anxiety while raising two children, and receive guidance tailored to your specific family situation—not generic advice, but wisdom that speaks directly to your circumstances.
            </p>

            <p>
              You heard a song with lyrics that moved you, and instantly discover its connection to Quranic teachings you never knew existed.
            </p>

            <p>
              This is not just search. It's connection. It's not just information. It's guidance.
            </p>

            <p>
              The Quran will no longer be something you consult—it will be something that accompanies you through life, offering wisdom precisely when and how you need it.
            </p>

            <p className="text-xl font-medium my-6">
              <strong>This is the future you can help build. A future where divine wisdom finds you.</strong>
            </p>

            <p>
              Unlike Imam Bukhari, who traveled thousands of miles alone, you have the opportunity to be part of something larger—a collective effort to transform how humanity accesses divine guidance.
            </p>

            <p>
              <strong>Your role in this journey matters:</strong>
            </p>

            <p>
              When you share this vision with others, you extend the bridge to those who need it most.
            </p>

            <p>
              When you join the community, you add your voice to shaping how AI connects people with Quranic guidance.
            </p>

            <p>
              When you contribute—whether through feedback, spreading the word, or supporting development—you accelerate the creation of tools that will benefit generations to come.
            </p>

            <p className="text-xl font-medium my-6">
              <strong>This is your invitation to the future.</strong>
            </p>

            <p>
              The gap between the Quran and your life has been closing for centuries—from oral to written, from manuscript to print, from physical to digital. Together, we can close it completely, creating a future where divine wisdom is truly accessible to everyone, everywhere, in every circumstance.
            </p>

            <p>
              The choice is yours: continue with the limitations of the present, or help build the bridge to a future where wisdom finds you.
            </p>

            <p>
              Your chapter in this story begins now.
            </p>
          </div>

          {/* Call to action */}
          <div className="mt-16 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Button size="lg" asChild>
              <a href="https://chat.whatsapp.com/JGX8Ysj8bQm6qPZ5YcxdGZ" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Join WhatsApp Group
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/sponsors/muhajirdev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Sponsor This Project
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" className="w-5 h-5" />
            <span className="text-sm text-white/70">QuranLabs</span>
          </div>
          <div className="text-sm text-white/50">
            An experimental research project
          </div>
        </div>
      </footer>
    </div>
  );
}
