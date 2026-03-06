import { useParams, Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  Tag,
  MenuIcon,
  XIcon,
  SparklesIcon,
  BookIcon,
  SearchIcon,
  BookMarkedIcon,
  BrainCircuitIcon,
  LayersIcon,
  NetworkIcon
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "~/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "~/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~/components/ui/accordion";
import { TafsirCard } from "~/components/tafsir/TafsirCard";
import { TafsirExplorer } from "~/components/tafsir/TafsirExplorer";
import { TranslationCard } from "~/components/translation/TranslationCard";
import { TranslationExplorer } from "~/components/translation/TranslationExplorer";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Footer } from "~/components/layout/Footer";
import { FloatingChatInterface } from "~/components/ai/FloatingChatInterface";
import type { Message } from "~/components/ai/FloatingChatInterface";
import { chatMessagesAtom, chatMinimizedAtom } from "~/store/chat";

interface VerseData {
  id: number;
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  text: string;
  juz?: number;
  hizb?: number;
  page_number?: number;
  translations?: {
    id: number;
    text: string;
    language: string;
    translator: string;
  }[];
  tafsirs?: {
    id: number;
    text: string;
    author: string;
    language: string;
  }[];
  topics?: {
    topic_id: number;
    name: string;
    description?: string;
  }[];
}

// Verse-specific suggestion chips
const VERSE_SUGGESTIONS = [
  { text: "What is the context of this verse?", icon: <BookIcon className="h-3 w-3" /> },
  { text: "Show me related verses", icon: <SearchIcon className="h-3 w-3" /> },
  { text: "Explain the meaning of this verse", icon: <BookMarkedIcon className="h-3 w-3" /> },
  { text: "What do scholars say about this verse?", icon: <BrainCircuitIcon className="h-3 w-3" /> },
  { text: "Compare different translations", icon: <LayersIcon className="h-3 w-3" /> },
  { text: "Show thematic connections", icon: <NetworkIcon className="h-3 w-3" /> },
];

export default function VerseDetailPage() {
  const { verse_key } = useParams();
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useAtom(chatMessagesAtom);
  const [chatMinimized, setChatMinimized] = useAtom(chatMinimizedAtom);

  useEffect(() => {
    async function fetchVerseData() {
      setLoading(true);
      setError(null);

      try {
        // Construct a Cypher query to get verse details and related data
        const query = `
          MATCH (v:Verse {verse_key: "${verse_key}"})
          OPTIONAL MATCH (v)-[r:HAS_TOPIC]->(t:Topic)
          OPTIONAL MATCH (v)-[rt:HAS_TAFSIR]->(tf:Tafsir)
          OPTIONAL MATCH (v)-[rtr:HAS_TRANSLATION]->(tr:Translation)
          RETURN v, collect(distinct t) as topics, collect(distinct tf) as tafsirs, collect(distinct tr) as translations
        `;

        const response = await fetch('https://kuzu-api.fly.dev/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch verse data');
        }

        const data = await response.json() as any;
        console.log("API response:", data);

        if (data.data && data.data.length > 0) {
          const verseNode = data.data[0].v;
          const topicsNodes = data.data[0].topics.filter((t: any) => t !== null);
          const tafsirNodes = data.data[0].tafsirs.filter((t: any) => t !== null);
          const translationNodes = data.data[0].translations.filter((t: any) => t !== null);

          // Process the verse data
          const processedData: VerseData = {
            id: verseNode.id || 0,
            verse_key: verseNode.verse_key,
            surah_number: verseNode.surah_number,
            ayah_number: verseNode.ayah_number || verseNode.verse_number,
            text: verseNode.text || verseNode.text_uthmani,
            juz: verseNode.juz || verseNode.juz_number,
            hizb: verseNode.hizb || verseNode.hizb_number,
            page_number: verseNode.page_number,
            topics: topicsNodes.map((t: any) => ({
              topic_id: t.topic_id,
              name: t.name,
              description: t.description
            })),
            tafsirs: tafsirNodes.map((t: any) => ({
              id: t.id || t.tafsir_id,
              text: t.text,
              author: t.source || t.author,
              language: t.language || 'en'
            })),
            translations: translationNodes.map((t: any) => ({
              id: t.id || t.translation_id,
              text: t.text,
              language: t.language || t.language_name || 'en',
              translator: t.translator || t.resource_name || 'Unknown'
            }))
          };

          setVerseData(processedData);
        } else {
          setError('Verse not found');
        }
      } catch (err) {
        console.error('Error fetching verse data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (verse_key) {
      fetchVerseData();
    }
  }, [verse_key]);

  // Function to handle translation comparison
  const handleCompareTranslations = (translationIds: number[]) => {
    if (!verseData || !verseData.translations) return;

    // Find the selected translations
    const selectedTranslations = verseData.translations.filter(t =>
      translationIds.includes(t.id)
    );

    if (selectedTranslations.length < 2) return;

    // Format the comparison as a message
    let comparisonText = `## Translation Comparison for ${verse_key}\n\n`;

    // Add a table header
    comparisonText += "| Translator | Translation |\n";
    comparisonText += "|------------|-------------|\n";

    // Add each translation as a row
    selectedTranslations.forEach(t => {
      comparisonText += `| **${t.translator}** (${t.language}) | ${t.text} |\n`;
    });

    // Add a user message to the chat
    const userMessage: Message = {
      role: "user",
      content: `Compare translations of ${verse_key}`
    };

    // Add the AI response with the comparison
    const aiResponse: Message = {
      role: "assistant",
      content: comparisonText
    };

    // Update chat messages
    setChatMessages(prev => [...prev, userMessage, aiResponse]);

    // Expand the chat if it's minimized
    if (chatMinimized) {
      setChatMinimized(false);
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] relative">
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Header */}
      <div className="bg-white/[0.02] backdrop-blur-xl border-b border-white/5 py-4 sticky top-0 z-10 transition-all duration-300">
        <div className="container mx-auto px-4 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
              <Link to="/data-explorer">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold text-white tracking-tight ml-2 flex items-center gap-2">
              <span className="text-accent">{verse_key}</span>
              <span className="text-white/50 text-base font-normal hidden sm:inline-block">| Quran Knowledge Graph</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/[0.02] border-white/5 hover:bg-white/10 text-white" asChild>
              <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`}>
                <NetworkIcon className="h-4 w-4 mr-2 text-accent" />
                <span className="hidden sm:inline-block">Explore Graph</span>
                <span className="sm:hidden">Explore</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive Context Banner with Discovery Elements */}
      <div className="bg-white/[0.02] border-b border-white/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Interactive Project Title */}
              <div className="text-sm text-white/50 mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 16V4a2 2 0 0 1 2-2h11" />
                  <path d="M5 14H4a2 2 0 1 0 0 4h1" />
                  <path d="M22 18H11a2 2 0 1 0 0 4h11" />
                  <path d="M11 22V2" />
                  <path d="m15 5 3 3-3 3" />
                </svg>
                <div className="group relative cursor-pointer">
                  <span className="group-hover:text-accent transition-colors">Quran Knowledge Graph</span>
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-64 p-3 bg-[#1c1c1c] rounded-md text-xs font-normal text-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/5">
                    <p className="font-medium mb-1">Quran Knowledge Graph</p>
                    <p className="text-white/50 mb-2">Interactive visualization of Quranic knowledge with connections between verses, topics, and scholarly interpretations.</p>
                    <div className="flex items-center gap-1 text-accent text-[10px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                      </svg>
                      Click to learn more
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Verse Title with Navigation Guidance */}
              <div className="relative group">
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                  <span className="group-hover:text-accent transition-colors">
                    Surah {verseData?.surah_number || '...'}, Ayah {verseData?.ayah_number || '...'}
                  </span>
                  <div className="relative group/info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 cursor-help">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div className="absolute left-0 -bottom-24 w-64 p-3 bg-[#1c1c1c] rounded-md text-sm font-normal text-white/90 shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50 border border-white/5">
                      <p className="mb-1 font-medium">Navigation Tip:</p>
                      <p className="text-xs text-white/50">Explore connections between verses and topics using the interactive tools below.</p>
                    </div>
                  </div>
                </h1>

                {/* Surah Information Tooltip */}
                <div className="absolute -bottom-28 left-0 w-72 p-3 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Surah Information</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/5 text-accent border-accent/20">
                      {verseData?.surah_number || '...'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-white/50">
                    <p>Click to explore the complete surah and its context</p>
                    <div className="flex items-center gap-1 text-accent text-[10px] mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                      </svg>
                      Hover over elements to discover more
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Metadata Badges with Discovery Elements */}
            <div className="flex flex-wrap gap-2">
              {/* Interactive Juz Badge */}
              <div className="relative group">
                {verseData?.juz && (
                  <div className="bg-white/[0.02] backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5 flex items-center gap-1.5 cursor-pointer hover:border-accent/30 hover:bg-white/[0.06] transition-all">
                    <span className="text-xs font-medium text-white/50 group-hover:text-accent transition-colors">Juz</span>
                    <span className="text-sm font-semibold text-white/90">{verseData.juz}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Juz {verseData?.juz}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/5 text-accent border-accent/20">
                      {verseData?.juz || '...'}/30
                    </Badge>
                  </div>
                  <p className="text-white/50 mb-2">One of 30 parts of the Quran, used for a month-long reading schedule</p>
                  <div className="flex items-center gap-1 text-accent text-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                    </svg>
                    Click to explore this Juz
                  </div>
                </div>
              </div>

              {/* Interactive Hizb Badge */}
              <div className="relative group">
                {verseData?.hizb && (
                  <div className="bg-white/[0.02] backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5 flex items-center gap-1.5 cursor-pointer hover:border-accent/30 hover:bg-white/[0.06] transition-all">
                    <span className="text-xs font-medium text-white/50 group-hover:text-accent transition-colors">Hizb</span>
                    <span className="text-sm font-semibold text-white/90">{verseData.hizb}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Hizb {verseData?.hizb}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/5 text-accent border-accent/20">
                      {verseData?.hizb || '...'}/60
                    </Badge>
                  </div>
                  <p className="text-white/50 mb-2">One of 60 divisions of the Quran, each Juz contains 2 Hizbs</p>
                  <div className="flex items-center gap-1 text-accent text-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                    </svg>
                    Click to explore this Hizb
                  </div>
                </div>
              </div>

              {/* Interactive Page Badge */}
              <div className="relative group">
                {verseData?.page_number && (
                  <div className="bg-white/[0.02] backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/5 flex items-center gap-1.5 cursor-pointer hover:border-accent/30 hover:bg-white/[0.06] transition-all">
                    <span className="text-xs font-medium text-white/50 group-hover:text-accent transition-colors">Page</span>
                    <span className="text-sm font-semibold text-white/90">{verseData.page_number}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Page {verseData?.page_number}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/5 text-accent border-accent/20">
                      {verseData?.page_number || '...'}/604
                    </Badge>
                  </div>
                  <p className="text-white/50 mb-2">Standard printed Quran pagination, with 604 total pages</p>
                  <div className="flex items-center gap-1 text-accent text-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                    </svg>
                    Click to explore this page
                  </div>
                </div>
              </div>

              {/* Interactive Navigation Badge */}
              <div className="relative group">
                <div className="bg-accent/10 backdrop-blur-sm px-3 py-1.5 rounded-md border border-accent/20 flex items-center gap-1.5 cursor-pointer hover:bg-accent/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                  <span className="text-xs font-medium text-accent">Explore</span>
                </div>
                <div className="absolute right-0 -bottom-44 w-56 p-3 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-medium mb-2">Exploration Options</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-sm cursor-pointer text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" />
                        <path d="M21 3v9h-9" />
                      </svg>
                      <span>Previous Verse</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-sm cursor-pointer text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74" />
                        <path d="M3 3v9h9" />
                      </svg>
                      <span>Next Verse</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-sm cursor-pointer text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                        <path d="M8.5 8.5v.01" />
                        <path d="M16 15.5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M11 17v.01" />
                        <path d="M7 14v.01" />
                      </svg>
                      <span>View in Knowledge Graph</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col justify-start overflow-hidden pt-12 pb-8">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <Skeleton className="h-16 w-3/4 bg-white/5 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Skeleton className="h-64 w-full bg-white/5 rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-40 w-full bg-white/5 rounded-lg mb-4" />
                  <Skeleton className="h-32 w-full bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 border border-destructive text-destructive rounded-xl max-w-2xl mx-auto shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-destructive/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                    <path d="M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Error Loading Verse</h2>
              </div>
              <p className="ml-10 text-white/80">{error}</p>
              <div className="mt-4 ml-10">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                  <Link to="/data-explorer">Return to Data Explorer</Link>
                </Button>
              </div>
            </div>
          ) : verseData ? (
            <>
              {/* Arabic Text Showcase - With explorative elements */}
              <div className="mb-12 max-w-4xl mx-auto">
                <div className="relative">
                  {/* Enhanced decorative elements with animations */}
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary/5 blur-xl animate-[pulse_8s_ease-in-out_infinite]"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-primary/5 blur-xl animate-[pulse_8s_ease-in-out_infinite_1s]"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -left-12 w-24 h-24 rounded-full bg-accent/5 blur-2xl opacity-30 animate-[pulse_10s_ease-in-out_infinite_2s]"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-12 w-24 h-24 rounded-full bg-accent/5 blur-2xl opacity-30 animate-[pulse_10s_ease-in-out_infinite_3s]"></div>

                  <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 shadow-sm overflow-hidden text-white w-full">
                    <div className="p-1">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-accent/40"></div>
                          <span className="text-xs font-medium text-white/50">Arabic Text</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Interactive controls with tooltips */}
                          <div className="relative group">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                              </svg>
                            </Button>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              Zoom text
                            </span>
                          </div>
                          <div className="relative group">
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <path d="M15 3h6v6" />
                                <path d="m10 14 11-11" />
                              </svg>
                            </Button>
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              Open in new tab
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Arabic text with word-by-word exploration */}
                    <div className="px-8 py-10 md:py-12 bg-white/[0.01] relative overflow-hidden">
                      {/* Subtle animated background pattern */}
                      <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `url(/images/geometric-pattern-animated.svg)`,
                        backgroundSize: '200%',
                        backgroundPosition: 'center',
                      }}></div>

                      {/* Subtle glow effects */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/5 blur-3xl opacity-20 animate-[pulse_15s_ease-in-out_infinite]"></div>

                      <div className="w-full text-center relative z-10">
                        <p className="text-3xl md:text-4xl text-center font-arabic arabic-xl leading-loose" dir="rtl" lang="ar">
                          {/* Split text into words for interactive exploration */}
                          {verseData.text.split(' ').map((word, index) => (
                            <span
                              key={index}
                              className="inline-block mx-1 relative group cursor-pointer hover:text-primary transition-colors"
                            >
                              {word}
                              <span className="absolute right-0 bottom-0 w-full h-0.5 bg-accent/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>

                              {/* Enhanced word exploration tooltip */}
                              <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 p-3 bg-[#1c1c1c]/90 backdrop-blur-2xl rounded-md text-sm font-normal text-white/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-white/10 font-sans">
                                <div className="text-xs text-center">
                                  <p className="font-medium mb-1 text-accent">Word Analysis</p>
                                  <p className="text-white/50">Click to explore root, grammar, and meaning</p>
                                </div>
                              </div>
                            </span>
                          ))}
                        </p>
                      </div>

                      {/* Enhanced interactive exploration prompt */}
                      <div className="mt-6 flex justify-center">
                        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-white/70 shadow-sm backdrop-blur-sm group hover:bg-accent/15 hover:border-accent/30 transition-all duration-300 cursor-help">
                          <span className="relative mr-2 flex h-4 w-4 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/30 opacity-75"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative text-accent">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                          </span>
                          <span className="group-hover:text-white/90 transition-colors duration-300">Hover over words to explore their meaning and grammar</span>
                        </div>
                      </div>
                    </div>

                    {/* Translation with interactive elements */}
                    {verseData.translations && verseData.translations.length > 0 && (
                      <div className="border-t border-white/5 px-8 py-6 bg-white/[0.02]">
                        <div className="text-lg text-center max-w-2xl mx-auto relative group">
                          {/* Find and use English translation by default */}
                          {(() => {
                            // Find English translation
                            const englishTranslation = verseData.translations.find(t =>
                              t.language.toLowerCase() === 'english'
                            );
                            // Use English if available, otherwise use first translation
                            return englishTranslation ? englishTranslation.text : verseData.translations[0].text;
                          })()}

                          {/* Interactive translation exploration */}
                          <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative group/tooltip">
                              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-[#1c1c1c]/80 shadow-sm border border-white/10 text-white/70 hover:text-white hover:bg-white/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 16v-4" />
                                  <path d="M12 8h.01" />
                                </svg>
                              </Button>
                              <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-32 px-2 py-1 bg-[#1c1c1c] border border-white/5 rounded-md text-xs font-normal text-white/90 shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                Compare translations
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-3">
                          {(() => {
                            // Find English translation
                            const englishTranslation = verseData.translations.find(t =>
                              t.language.toLowerCase() === 'english'
                            );
                            // Use English if available, otherwise use first translation
                            const translation = englishTranslation || verseData.translations[0];

                            return (
                              <>
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">{translation.translator.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="text-sm text-muted-foreground group relative">
                                  <span className="group-hover:text-primary transition-colors">{translation.translator}</span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 ml-2 rounded-sm text-xs font-medium bg-primary/10 text-primary">
                                    {translation.language}
                                  </span>

                                  {/* Translator info tooltip */}
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <span className="ml-1 text-primary cursor-help">ⓘ</span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-64">
                                      <div className="flex justify-between space-y-1">
                                        <h4 className="font-medium">About this translator</h4>
                                      </div>
                                      <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                          Click to see more translations by {translation.translator}
                                        </p>
                                        <div className="flex items-center pt-2">
                                          <span className="bg-primary/10 text-primary text-xs rounded-sm px-1.5 py-0.5">
                                            {translation.language}
                                          </span>
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Translations and Tafsir */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Translations Card - Using the refactored TranslationCard component */}
                  {verseData.translations && verseData.translations.length > 1 && (
                    <TranslationCard
                      translations={verseData.translations}
                      verseKey={verseData.verse_key}
                      onCompare={(ids) => {
                        // Handle comparison logic here
                        if (ids.length < 2) return;

                        const safeTranslations = verseData.translations || [];

                        // Find the selected translations
                        const selectedTranslations = safeTranslations.filter(t =>
                          ids.includes(t.id)
                        );

                        // Format the comparison as a message
                        let comparisonText = `## Translation Comparison for ${verseData.verse_key}\n\n`;

                        // Add a table header
                        comparisonText += "| Translator | Translation |\n";
                        comparisonText += "|------------|-------------|\n";

                        // Add each translation as a row
                        selectedTranslations.forEach(t => {
                          comparisonText += `| **${t.translator}** (${t.language}) | ${t.text} |\n`;
                        });

                        // Create a list of selected translators for the user message
                        const translatorsList = selectedTranslations
                          .map(t => t.translator)
                          .join(", ");

                        // Add messages to chat
                        setChatMessages(prev => [
                          ...prev,
                          {
                            role: "user",
                            content: `Compare translations of ${verseData.verse_key} by ${translatorsList}`
                          },
                          { role: "assistant", content: comparisonText }
                        ]);

                        // Expand the chat
                        setChatMinimized(false);
                      }}
                    />
                  )}

                  {/* Commentary Card - Using the refactored TafsirCard component */}
                  {verseData.tafsirs && verseData.tafsirs.length > 0 && (
                    <TafsirCard tafsirs={verseData.tafsirs} />
                  )}
                </div>

                {/* Right Column - Inspired by Raycast's sidebar design */}
                <div className="space-y-6">
                  {/* Translation Explorer Component */}
                  {verseData.verse_key && (
                    <TranslationExplorer verseKey={verseData.verse_key} />
                  )}

                  {/* Tafsir Explorer Component */}
                  {verseData.verse_key && (
                    <TafsirExplorer verseKey={verseData.verse_key} />
                  )}

                  {/* Topics Panel - Inspired by Linear's tag design */}
                  {verseData.topics && verseData.topics.length > 0 && (
                    <div className="bg-white/[0.02] rounded-xl border border-white/5 shadow-sm overflow-hidden text-white/90">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1c1c1c]/50">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                            <Tag className="h-3.5 w-3.5 text-accent" />
                          </div>
                          <h3 className="font-medium text-white">Topics</h3>
                        </div>
                        <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 text-xs font-normal">
                          {verseData.topics.length}
                        </Badge>
                      </div>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {verseData.topics.map((topic, index) => (
                            <Link key={index} to={`/topic/${topic.topic_id}`}>
                              <div className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-accent/10 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-200"></div>
                                <div className="relative bg-[#1c1c1c] px-3 py-1.5 rounded-full border border-white/10 hover:border-accent/30 flex items-center gap-1.5 transition-all duration-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-hover:text-accent transition-colors">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                  </svg>
                                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{topic.name}</span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Panel - Inspired by Raycast's clean info display */}
                  <div className="bg-white/[0.02] rounded-xl border border-white/5 shadow-sm overflow-hidden text-white/90">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#1c1c1c]/50">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                            <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                            <circle cx="18.5" cy="15.5" r="2.5" />
                            <path d="M20.27 17.27 22 19" />
                          </svg>
                        </div>
                        <h3 className="font-medium text-white">Metadata</h3>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                          <span className="text-sm text-white/50">Verse Key</span>
                          <span className="text-sm font-medium text-white">{verseData.verse_key}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-xs text-white/50 mb-1">Surah</span>
                            <span className="text-lg font-medium text-white">{verseData.surah_number}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-xs text-white/50 mb-1">Ayah</span>
                            <span className="text-lg font-medium text-white">{verseData.ayah_number}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {verseData.juz && (
                            <div className="flex flex-col items-center justify-center px-2 py-2 bg-white/5 rounded-lg border border-white/5">
                              <span className="text-xs text-white/50 mb-0.5">Juz</span>
                              <span className="text-base font-medium text-white">{verseData.juz}</span>
                            </div>
                          )}
                          {verseData.hizb && (
                            <div className="flex flex-col items-center justify-center px-2 py-2 bg-white/5 rounded-lg border border-white/5">
                              <span className="text-xs text-white/50 mb-0.5">Hizb</span>
                              <span className="text-base font-medium text-white">{verseData.hizb}</span>
                            </div>
                          )}
                          {verseData.page_number && (
                            <div className="flex flex-col items-center justify-center px-2 py-2 bg-white/5 rounded-lg border border-white/5">
                              <span className="text-xs text-white/50 mb-0.5">Page</span>
                              <span className="text-base font-medium text-white">{verseData.page_number}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Panel - Dark theme matching screenshot */}
                  <div className="bg-[#1c1c1c] rounded-xl border border-white/5 shadow-sm overflow-hidden">
                    <div className="flex items-center px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                            <path d="M8.5 8.5v.01" />
                            <path d="M16 15.5v.01" />
                            <path d="M12 12v.01" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-white">Explore</h3>
                      </div>
                    </div>

                    <div className="px-5 py-4 space-y-3">
                      {/* Primary action - Knowledge Graph */}
                      <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`} className="block">
                        <div className="bg-[#252525] hover:bg-[#2a2a2a] px-4 py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all duration-200 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                          </svg>
                          <span className="text-base font-medium text-white">View in Knowledge Graph</span>
                        </div>
                      </Link>

                      {/* Secondary actions with consistent layout */}
                      <div className="grid grid-cols-1 gap-3">
                        <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic)<-[:HAS_TOPIC]-(v2:Verse) WHERE v.verse_key = "${verse_key}" AND v2 <> v RETURN v, v2, t LIMIT 30`} className="block">
                          <div className="bg-[#252525] hover:bg-[#2a2a2a] px-4 py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M8 15h8" />
                              <path d="M8 9h8" />
                            </svg>
                            <span className="text-base font-medium text-white">Find Related Verses</span>
                          </div>
                        </Link>

                        <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[:HAS_TOPIC]->(t:Topic) RETURN v, t LIMIT 10`} className="block">
                          <div className="bg-[#252525] hover:bg-[#2a2a2a] px-4 py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                            </svg>
                            <span className="text-base font-medium text-white">Explore Topics</span>
                          </div>
                        </Link>
                      </div>

                      {/* Action buttons with improved layout */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#333333]">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium text-white">Share</span>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full text-white hover:bg-[#333333]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                            </svg>
                            <span className="sr-only">More</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>

      <Footer />

      {/* Floating Chat Interface */}
      <FloatingChatInterface
        title="Verse Assistant"
        contextId={verse_key}
        suggestions={VERSE_SUGGESTIONS}
        onSendMessage={async (queryText) => {
          // Simulate AI response (in a real app, this would call an API)
          return new Promise((resolve) => {
            setTimeout(() => {
              // Generate a response based on the query and verse
              let response = "";
              if (queryText.toLowerCase().includes("context")) {
                response = `This verse (${verse_key}) discusses the importance of guidance. It's part of a larger section about divine wisdom and mercy.`;
              } else if (queryText.toLowerCase().includes("meaning")) {
                response = `The verse ${verse_key} emphasizes the concept of divine guidance and mercy. It reminds believers of God's compassion and wisdom in providing direction for humanity.`;
              } else if (queryText.toLowerCase().includes("related")) {
                response = `Verses related to ${verse_key} include those discussing guidance, mercy, and divine wisdom. You might want to explore verses in the same surah that expand on these themes.`;
              } else if (queryText.toLowerCase().includes("scholars")) {
                response = `Scholars have interpreted verse ${verse_key} in various ways. Many emphasize its message about divine guidance and the importance of following the straight path.`;
              } else if (queryText.toLowerCase().includes("translation")) {
                response = `There are several translations of verse ${verse_key}, each with subtle differences in wording but maintaining the core message about guidance and mercy.`;
              } else if (queryText.toLowerCase().includes("thematic") || queryText.toLowerCase().includes("connection")) {
                response = `Verse ${verse_key} connects thematically with other verses discussing guidance, mercy, faith, and the relationship between God and humanity.`;
              } else {
                response = `Verse ${verse_key} is an important part of the Quran's message. It contains wisdom about divine guidance and the path to righteousness. Would you like to know more about a specific aspect of this verse?`;
              }
              resolve(response);
            }, 1500);
          });
        }}
      />
    </div>
  );
}

export function meta() {
  return [
    { title: "Verse Detail | Quran Knowledge Graph" },
    { description: "Detailed information about a verse from the Quran Knowledge Graph" },
  ];
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header - Inspired by Linear/Raycast */}
      <div className="bg-white/[0.02] backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-white/20 animate-pulse"></div>
              </div>
              <div className="h-6 w-24 bg-white/10 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-28 bg-white/10 rounded-md animate-pulse"></div>
              <div className="h-8 w-20 bg-white/10 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Banner - Inspired by Resend */}
      <div className="bg-white/[0.02] border-b border-white/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-4 w-40 bg-white/10 rounded-md animate-pulse mb-2"></div>
              <div className="h-8 w-64 bg-white/10 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-20 bg-white/10 rounded-md animate-pulse"></div>
              <div className="h-8 w-20 bg-white/10 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-accent/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-accent rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-white mb-2">Loading Verse</p>
          <p className="text-white/50">Retrieving data from Quran Knowledge Graph...</p>
        </div>

        {/* Skeleton Layout - Inspired by Raycast/Linear */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-30">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
