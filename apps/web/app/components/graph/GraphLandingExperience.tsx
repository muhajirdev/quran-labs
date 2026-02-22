"use client";

import * as React from "react";
import { useState } from "react";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";
import { SparklesIcon, Network, ExternalLink, ArrowRight } from "lucide-react";
import { MinimalGraphViewer } from "./MinimalGraphViewer";
import { useNavigate } from "react-router";
import { Footer } from "../layout/Footer";

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
                                className={`group flex flex-col items-start p-4 rounded-xl border transition-all duration-300 text-left ${activeQuery === suggestion.query
                                    ? "bg-accent/10 border-accent relative shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-accent/50 scale-[1.02]"
                                    : "bg-white/[0.02] border-white/5 hover:border-accent/40 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-lg"
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
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-12 mb-12 px-4">
                    <Button
                        variant="outline"
                        className="group relative overflow-hidden bg-transparent text-white/90 border-white/20 hover:border-white/50 hover:text-white px-8 py-6 rounded-full text-base font-medium transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 w-full sm:w-auto"
                        onClick={() => navigate('vision')}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-0 group-hover:gap-2 transition-all duration-300">
                            Read the Journey
                            <ArrowRight className="w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300 overflow-hidden" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </Button>
                    <div className="relative group w-full sm:w-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-md opacity-50 group-hover:opacity-100 transition duration-500" />
                        <Button
                            className="relative w-full overflow-hidden bg-white text-black hover:bg-white px-8 py-6 rounded-full text-base font-semibold shadow-lg transition-all duration-500 hover:-translate-y-1"
                            onClick={() => navigate('/data-explorer')}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2 group-hover:gap-3 transition-all duration-300">
                                Start Full Data Exploration
                                <SparklesIcon className="w-5 h-5 text-black group-hover:rotate-12 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <Footer />

            </main>
        </div>
    );
};
