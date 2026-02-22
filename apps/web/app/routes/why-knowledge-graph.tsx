import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/why-knowledge-graph";
import { Button } from "~/components/ui/button";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Logo } from "~/components/ui/logo";
import { cn } from "~/lib/utils";
import { ArrowLeft, Database, Route as RouteIcon, Binary, Cpu } from "lucide-react";
import { Footer } from "~/components/layout/Footer";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Why Knowledge Graph | Quranic Intelligence" },
    {
      name: "description",
      content:
        "Understanding why knowledge graphs are critical for AI and human reasoning",
    },
  ];
}

export default function WhyKnowledgeGraphPage() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY.current;
      lastScrollY.current = currentScrollY;

      if (isScrollingDown && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Decorative background */}
      <GeometricDecoration variant="animated" opacity={0.6} />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent to-black/40 z-0" />

      {/* Header */}
      <header
        className={cn(
          "fixed left-0 right-0 z-20 transition-all duration-300 backdrop-blur-md border-b border-white/5",
          isHeaderVisible ? "top-0" : "-top-20"
        )}
      >
        <div className="flex items-center justify-between py-4 px-4 sm:px-6 relative z-10">
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
              <span className="font-medium tracking-wide">Why Knowledge Graph</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20 relative z-10">
        {/* Hero */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-24 mt-12">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            AI Without Structure is <br className="hidden md:block" />
            <span className="text-white/50">Wandering in the Dark</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/60 max-w-2xl font-light leading-relaxed">
            Humans and AI both need connected knowledge. Not scattered data.
          </p>
        </section>

        {/* The Gap */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-20">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white/80">
              The Problem
            </h2>
            <p className="text-lg text-white/60 leading-relaxed mb-6">
              AI has access to billions of words, but words without relationships are just noise.
              It struggles to trace a concept across sources, misses temporal connections,
              and fails to understand context without extensive searching.
            </p>
            <div className="flex items-center gap-4 text-accent">
              <span className="text-4xl font-bold">12</span>
              <span className="text-white/50">MCP calls needed</span>
              <span className="text-white/30">→</span>
              <span className="text-4xl font-bold text-white">3</span>
              <span className="text-white/50">calls with knowledge graph</span>
            </div>
            <p className="text-sm text-white/40 mt-4">
              That's what GitLab found when giving their AI structured knowledge instead of raw text.
            </p>
          </div>
        </section>
        {/* The Solution */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white/80">
            The Solution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Point 1: Organized */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white">Organized</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                Centuries of scholarship — Tafsir, Hadith, linguistic analysis —
                unified in one connected structure. Everything has a place, and
                everything is linked.
              </p>
            </div>

            {/* Point 2: Traceable */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <RouteIcon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white">Traceable</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                Follow any thread to its source. See where an interpretation came
                from, understand the chain of meaning, verify the scholarship.
              </p>
            </div>

            {/* Point 3: Reveals Patterns */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Binary className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white">Reveals Patterns</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                Connections invisible in linear reading become visible. The same
                Arabic root across 114 surahs. Temporal patterns. Thematic threads
                spanning centuries.
              </p>
            </div>

            {/* Point 4: AI Reasoning Engine */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white">AI Reasoning Engine</h3>
              </div>
              <p className="text-white/60 leading-relaxed">
                When AI has structured knowledge, it doesn't guess relationships —
                they're already mapped. 4x more efficient, higher accuracy,
                grounded in verified sources.
              </p>
            </div>
          </div>
        </section>

        {/* The Result */}
        <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-24">
          <div className="text-center py-16 border-t border-b border-white/10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
              Better Answers. Faster.
            </h2>
            <p className="text-xl text-white/60 max-w-xl mx-auto leading-relaxed">
              For humans exploring the Quran. For AI helping them understand it.
              Knowledge graphs don't replace thinking — they enable deeper thinking.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
