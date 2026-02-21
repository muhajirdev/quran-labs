"use client";

import * as React from "react";
import { useState } from "react";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";
import { SparklesIcon, Network, ExternalLink } from "lucide-react";
import { MinimalGraphViewer } from "./MinimalGraphViewer";
import { useNavigate } from "react-router";

const GRAPH_SUGGESTIONS = [
    {
        title: "Surah Al-Fatihah",
        query: 'MATCH (v:Verse {verse_key: "1:1"})-[r]-(n) RETURN v, r, n LIMIT 20',
        description: "Explore connections in the opening chapter",
        icon: Network
    },
    {
        title: "Ayatul Kursi",
        query: 'MATCH (v:Verse {verse_key: "2:255"})-[r]-(n) RETURN v, r, n LIMIT 20',
        description: "Explore connections of the Throne Verse",
        icon: Network
    },
    {
        title: "Story of Prophet Musa",
        query: 'MATCH (t:Topic {name: "Musa"})<-[r:HAS_TOPIC]-(v:Verse) RETURN t, r, v LIMIT 15',
        description: "Network of verses about Musa",
        icon: Network
    },
    {
        title: "Surah Al-Ikhlas",
        query: 'MATCH (v:Verse {verse_key: "112:1"})-[r]-(n) RETURN v, r, n LIMIT 20',
        description: "Connections in the chapter of Sincerity",
        icon: SparklesIcon
    }
];

export const GraphLandingExperience = () => {
    const [activeQuery, setActiveQuery] = useState<string | null>(null);
    const [activeTitle, setActiveTitle] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSuggestionClick = (suggestion: typeof GRAPH_SUGGESTIONS[0]) => {
        setActiveQuery(suggestion.query);
        setActiveTitle(suggestion.title);
    };

    const handleExploreData = () => {
        if (activeQuery) {
            navigate(`/data-explorer?query=${encodeURIComponent(activeQuery)}`);
        } else {
            navigate('/data-explorer');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0A0A] relative transition-all duration-300">
            {/* Animated Geometric Pattern Background */}
            <GeometricDecoration variant="animated" />

            {/* Main content */}
            <main className="flex-1 flex flex-col justify-start pt-12 sm:pt-20 overflow-y-auto pb-20 sm:pb-24 z-10 px-4">

                {/* Hero Section */}
                <div className="flex flex-col items-center transition-all duration-500 ease-in-out px-4 sm:px-6 mb-8 sm:mb-12">

                    {/* Enhanced logo */}
                    <div className="mb-6 sm:mb-8 relative">
                        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full transform scale-125 opacity-50 animate-[pulse_4s_ease-in-out_infinite]"></div>
                        <div className="relative p-4 sm:p-5 rounded-full hover:scale-105 transition-all duration-500 overflow-hidden group">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 relative z-10">
                                <Logo size="lg" className="w-full h-full group-hover:brightness-110 transition-all duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Brand title */}
                    <div className="relative mb-6 text-center">
                        <div className="text-accent/80 text-sm font-bold tracking-[0.2em] uppercase mb-4 font-mono">
                            The Data Layer for Quran AI
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white relative z-10">
                            Knowledge Graph
                        </h1>
                    </div>

                    {/* Tagline */}
                    <div className="text-center mb-8 max-w-2xl">
                        <p className="text-white/70 text-base sm:text-lg text-center leading-relaxed px-6">
                            Not a scholar in a box. A lens for seeing deeper. Explore the full tradition of the Quran — accessible, transparent, and always traceable.
                        </p>
                    </div>
                </div>

                {/* Interactive Demo Section */}
                <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">

                    {/* Graph Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {GRAPH_SUGGESTIONS.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left ${activeQuery === suggestion.query
                                    ? "bg-accent/10 border-accent relative shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                    : "bg-white/[0.02] border-white/5 hover:border-accent/30 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2 text-white/90 font-medium">
                                    <suggestion.icon className={`h-4 w-4 ${activeQuery === suggestion.query ? "text-accent" : "text-white/50"}`} />
                                    {suggestion.title}
                                </div>
                                <p className="text-white/50 text-xs sm:text-sm line-clamp-2">
                                    {suggestion.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    {/* Graph Viewer Container */}
                    <div className="mt-4 transition-all duration-500 ease-in-out min-h-[400px]">
                        {activeQuery ? (
                            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white/80 font-medium">Displaying: {activeTitle}</h3>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-white/70 border-white/10 hover:border-white/20 hover:text-white group"
                                        onClick={handleExploreData}
                                    >
                                        Open Data Explorer
                                        <ExternalLink className="ml-2 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Button>
                                </div>
                                <MinimalGraphViewer query={activeQuery} />
                            </div>
                        ) : (
                            <div className="w-full h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                                <Network className="w-12 h-12 text-white/20 mb-4" />
                                <p className="text-white/40 text-center max-w-sm">
                                    Select one of the demos above to see a live visualization of the Quran graph.
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Global CTA */}
                <div className="flex justify-center items-center gap-4 mt-12 mb-8">
                    <Button
                        variant="outline"
                        className="bg-transparent text-white border-white/20 hover:bg-white/5 hover:border-white/40 px-6 py-6 rounded-full text-base font-medium transition-all"
                        onClick={() => navigate('/journey')}
                    >
                        Read the Journey
                    </Button>
                    <Button
                        className="bg-white text-black hover:bg-white/90 px-8 py-6 rounded-full text-base font-medium shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all"
                        onClick={() => navigate('/data-explorer')}
                    >
                        Start Full Data Exploration
                        <SparklesIcon className="ml-2 w-4 h-4" />
                    </Button>
                </div>

                {/* Footer */}
                <footer className="w-full mt-20 pt-16 pb-8 border-t border-white/5 relative z-20 bg-black/20">
                    <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-12 md:gap-8">

                        {/* Brand Column */}
                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex items-center gap-3">
                                <Logo size="sm" className="w-8 h-8 opacity-80" />
                                <span className="text-white font-bold tracking-tight">SuperQuran Graph</span>
                            </div>
                            <p className="text-white/40 text-sm leading-relaxed">
                                The semantic data layer for Quran AI. Building the infrastructure to explore the profound connections within the Quranic tradition.
                            </p>
                        </div>

                        {/* Links Columns */}
                        <div className="flex gap-16">
                            {/* Explore */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white font-medium text-sm">Explore</h4>
                                <div className="flex flex-col gap-3 text-sm text-white/50">
                                    <button onClick={() => navigate('/journey')} className="text-left hover:text-white transition-colors">The Journey</button>
                                    <button onClick={() => navigate('/data-explorer')} className="text-left hover:text-white transition-colors">Data Explorer</button>
                                    <button onClick={() => navigate('/read')} className="text-left hover:text-white transition-colors">Read Quran</button>
                                </div>
                            </div>

                            {/* Contact & Legal */}
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white font-medium text-sm">Connect</h4>
                                <div className="flex flex-col gap-3 text-sm text-white/50">
                                    <a
                                        href="https://github.com/muhajirdev/quran-labs"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        GitHub (Open Source)
                                    </a>
                                    <a href="mailto:muhammad@muhajir.dev" className="hover:text-white transition-colors">Email</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
                        <p>© {new Date().getFullYear()} SuperQuran Graph. All rights reserved.</p>
                        <p>Built for the Ummah</p>
                    </div>
                </footer>

            </main>
        </div>
    );
};
