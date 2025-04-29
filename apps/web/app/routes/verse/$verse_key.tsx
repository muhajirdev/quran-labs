import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, MessageSquare, Tag } from "lucide-react";
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

export default function VerseDetailPage() {
  const { verse_key } = useParams();
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Advanced Header with Exploration Controls */}
      <div className="bg-background/60 backdrop-blur-xl border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors" asChild>
                  <Link to="/data-explorer">
                    <ArrowLeft className="h-5 w-5 text-primary" />
                  </Link>
                </Button>
                <div className="absolute left-0 -bottom-10 w-36 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Back to Data Explorer
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative group">
                  <h1 className="text-xl font-semibold text-foreground">Verse</h1>
                  <div className="absolute left-0 -bottom-10 w-48 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Quranic verse details
                  </div>
                </div>

                <div className="relative group">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
                    {verse_key}
                  </Badge>
                  <div className="absolute left-0 -bottom-10 w-48 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    Surah {verse_key.split(':')[0]}, Verse {verse_key.split(':')[1]}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Action Bar */}
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs font-medium" asChild>
                  <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Explore Graph
                  </Link>
                </Button>
                <div className="absolute right-0 -bottom-10 w-48 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  View connections in Knowledge Graph
                </div>
              </div>

              <div className="relative group">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                    <path d="M10 2c1 .5 2 2 2 5" />
                  </svg>
                  Share
                </Button>
                <div className="absolute right-0 -bottom-24 w-48 p-2 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-medium mb-1">Share this verse</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="h-6 w-6 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>

              {/* View Mode Selector */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59C10.21 6.04 10 5.53 10 5c0-.53.21-1.04.59-1.41C10.96 3.21 11.47 3 12 3zM12 10c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59-.38-.37-.59-.88-.59-1.41 0-.53.21-1.04.59-1.41.37-.38.88-.59 1.41-.59zM12 17c.53 0 1.04.21 1.41.59.38.37.59.88.59 1.41 0 .53-.21 1.04-.59 1.41-.37.38-.88.59-1.41.59-.53 0-1.04-.21-1.41-.59-.38-.37-.59-.88-.59-1.41 0-.53.21-1.04.59-1.41.37-.38.88-.59 1.41-.59z" />
                  </svg>
                  More
                </Button>
                <div className="absolute right-0 -bottom-32 w-48 p-2 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-medium mb-1">View Options</p>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-center gap-2 p-1 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12h20M2 12a10 10 0 0 1 10-10v20A10 10 0 0 1 2 12Z" />
                      </svg>
                      Reading Mode
                    </div>
                    <div className="flex items-center gap-2 p-1 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 4h6v6M10 20H4v-6M14.5 9.5 21 3M3 21l6.5-6.5" />
                      </svg>
                      Fullscreen
                    </div>
                    <div className="flex items-center gap-2 p-1 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3v12" />
                        <path d="M6 9h12" />
                      </svg>
                      Expand All Sections
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Context Banner with Discovery Elements */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {/* Interactive Project Title */}
              <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 16V4a2 2 0 0 1 2-2h11" />
                  <path d="M5 14H4a2 2 0 1 0 0 4h1" />
                  <path d="M22 18H11a2 2 0 1 0 0 4h11" />
                  <path d="M11 22V2" />
                  <path d="m15 5 3 3-3 3" />
                </svg>
                <div className="group relative cursor-pointer">
                  <span className="group-hover:text-primary transition-colors">Quran Knowledge Graph</span>
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-64 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="font-medium mb-1">Quran Knowledge Graph</p>
                    <p className="text-muted-foreground mb-2">Interactive visualization of Quranic knowledge with connections between verses, topics, and scholarly interpretations.</p>
                    <div className="flex items-center gap-1 text-primary text-[10px]">
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
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <span className="group-hover:text-primary transition-colors">
                    Surah {verseData?.surah_number || '...'}, Ayah {verseData?.ayah_number || '...'}
                  </span>
                  <div className="relative group/info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground cursor-help">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div className="absolute left-0 -bottom-24 w-64 p-3 bg-popover rounded-md text-sm font-normal text-popover-foreground shadow-lg opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none z-50">
                      <p className="mb-1 font-medium">Navigation Tip:</p>
                      <p className="text-xs text-muted-foreground">Explore connections between verses and topics using the interactive tools below.</p>
                    </div>
                  </div>
                </h1>

                {/* Surah Information Tooltip */}
                <div className="absolute -bottom-28 left-0 w-72 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Surah Information</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                      {verseData?.surah_number || '...'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Click to explore the complete surah and its context</p>
                    <div className="flex items-center gap-1 text-primary text-[10px] mt-1">
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
                  <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border flex items-center gap-1.5 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Juz</span>
                    <span className="text-sm font-semibold">{verseData.juz}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Juz {verseData?.juz}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                      {verseData?.juz || '...'}/30
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">One of 30 parts of the Quran, used for a month-long reading schedule</p>
                  <div className="flex items-center gap-1 text-primary text-[10px]">
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
                  <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border flex items-center gap-1.5 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Hizb</span>
                    <span className="text-sm font-semibold">{verseData.hizb}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Hizb {verseData?.hizb}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                      {verseData?.hizb || '...'}/60
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">One of 60 divisions of the Quran, each Juz contains 2 Hizbs</p>
                  <div className="flex items-center gap-1 text-primary text-[10px]">
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
                  <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border flex items-center gap-1.5 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Page</span>
                    <span className="text-sm font-semibold">{verseData.page_number}</span>
                  </div>
                )}
                <div className="absolute left-0 -bottom-32 w-56 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Page {verseData?.page_number}</p>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                      {verseData?.page_number || '...'}/604
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">Standard printed Quran pagination, with 604 total pages</p>
                  <div className="flex items-center gap-1 text-primary text-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20v-6m0 0V4m0 10h6m-6 0H6" />
                    </svg>
                    Click to explore this page
                  </div>
                </div>
              </div>

              {/* Interactive Navigation Badge */}
              <div className="relative group">
                <div className="bg-primary/10 backdrop-blur-sm px-3 py-1.5 rounded-md border border-primary/20 flex items-center gap-1.5 cursor-pointer hover:bg-primary/20 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                  <span className="text-xs font-medium text-primary">Explore</span>
                </div>
                <div className="absolute right-0 -bottom-44 w-56 p-3 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-medium mb-2">Exploration Options</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24" />
                        <path d="M21 3v9h-9" />
                      </svg>
                      <span>Previous Verse</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74" />
                        <path d="M3 3v9h9" />
                      </svg>
                      <span>Next Verse</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-sm cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            <div className="flex justify-center mb-8">
              <Skeleton className="h-16 w-3/4 bg-muted rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Skeleton className="h-64 w-full bg-muted rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-40 w-full bg-muted rounded-lg mb-4" />
                <Skeleton className="h-32 w-full bg-muted rounded-lg" />
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
            <p className="ml-10">{error}</p>
            <div className="mt-4 ml-10">
              <Button variant="outline" size="sm" asChild>
                <Link to="/data-explorer">Return to Data Explorer</Link>
              </Button>
            </div>
          </div>
        ) : verseData ? (
          <>
            {/* Arabic Text Showcase - With explorative elements */}
            <div className="mb-12 max-w-4xl mx-auto">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary/5 blur-xl"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-primary/5 blur-xl"></div>

                <div className="bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm rounded-xl border border-border/40 shadow-sm overflow-hidden">
                  <div className="p-1">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                        <span className="text-xs font-medium text-muted-foreground">Arabic Text</span>
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
                  <div className="px-8 py-10 md:py-12 bg-gradient-to-b from-background/50 to-background/20">
                    <div className="w-full text-center">
                      <p className="text-3xl md:text-4xl text-center font-arabic leading-loose tracking-wide" dir="rtl" lang="ar">
                        {/* Split text into words for interactive exploration */}
                        {verseData.text.split(' ').map((word, index) => (
                          <span
                            key={index}
                            className="inline-block mx-1 relative group cursor-pointer hover:text-primary transition-colors"
                          >
                            {word}
                            <span className="absolute right-0 bottom-0 w-full h-0.5 bg-primary/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></span>

                            {/* Word exploration tooltip */}
                            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 p-3 bg-popover backdrop-blur-2xl rounded-md text-sm font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 ">
                              <div className="text-xs text-center">
                                <p className="font-medium mb-1 text-primary">Word Analysis</p>
                                <p className="text-muted-foreground">Click to explore root, grammar, and meaning</p>
                              </div>
                            </div>
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* Interactive exploration prompt */}
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-primary">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        Hover over words to explore their meaning and grammar
                      </div>
                    </div>
                  </div>

                  {/* Translation with interactive elements */}
                  {verseData.translations && verseData.translations.length > 0 && (
                    <div className="border-t border-border/30 px-8 py-6 bg-muted/10">
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
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-background/80 shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                              </svg>
                            </Button>
                            <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-32 px-2 py-1 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
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
                      console.log("Compare translations:", ids);
                      // Handle comparison logic here
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
                  <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Tag className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <h3 className="font-medium">Topics</h3>
                      </div>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal">
                        {verseData.topics.length}
                      </Badge>
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {verseData.topics.map((topic, index) => (
                          <Link key={index} to={`/topic/${topic.topic_id}`}>
                            <div className="group relative">
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-200"></div>
                              <div className="relative bg-background px-3 py-1.5 rounded-full border border-border/50 hover:border-primary/30 flex items-center gap-1.5 transition-all duration-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70 group-hover:text-primary transition-colors">
                                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                                </svg>
                                <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">{topic.name}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata Panel - Inspired by Raycast's clean info display */}
                <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                          <circle cx="18.5" cy="15.5" r="2.5" />
                          <path d="M20.27 17.27 22 19" />
                        </svg>
                      </div>
                      <h3 className="font-medium">Metadata</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/10 rounded-lg border border-border/30">
                        <span className="text-sm text-muted-foreground">Verse Key</span>
                        <span className="text-sm font-medium">{verseData.verse_key}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-muted/10 rounded-lg border border-border/30">
                          <span className="text-xs text-muted-foreground mb-1">Surah</span>
                          <span className="text-lg font-medium">{verseData.surah_number}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-muted/10 rounded-lg border border-border/30">
                          <span className="text-xs text-muted-foreground mb-1">Ayah</span>
                          <span className="text-lg font-medium">{verseData.ayah_number}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {verseData.juz && (
                          <div className="flex flex-col items-center justify-center px-2 py-2 bg-muted/10 rounded-lg border border-border/30">
                            <span className="text-xs text-muted-foreground mb-0.5">Juz</span>
                            <span className="text-base font-medium">{verseData.juz}</span>
                          </div>
                        )}
                        {verseData.hizb && (
                          <div className="flex flex-col items-center justify-center px-2 py-2 bg-muted/10 rounded-lg border border-border/30">
                            <span className="text-xs text-muted-foreground mb-0.5">Hizb</span>
                            <span className="text-base font-medium">{verseData.hizb}</span>
                          </div>
                        )}
                        {verseData.page_number && (
                          <div className="flex flex-col items-center justify-center px-2 py-2 bg-muted/10 rounded-lg border border-border/30">
                            <span className="text-xs text-muted-foreground mb-0.5">Page</span>
                            <span className="text-base font-medium">{verseData.page_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Panel - Dark theme matching screenshot */}
                <div className="bg-[#1c1c1c] rounded-xl border border-border/30 shadow-sm overflow-hidden">
                  <div className="flex items-center px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-[#2c2c2c] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
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
    <div className="min-h-screen bg-background">
      {/* Header - Inspired by Linear/Raycast */}
      <div className="bg-background/60 backdrop-blur-xl border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-muted animate-pulse"></div>
              </div>
              <div className="h-6 w-24 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-28 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Banner - Inspired by Resend */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="h-4 w-40 bg-muted/50 rounded-md animate-pulse mb-2"></div>
              <div className="h-8 w-64 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse"></div>
              <div className="h-8 w-20 bg-muted/50 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-foreground mb-2">Loading Verse</p>
          <p className="text-muted-foreground">Retrieving data from Quran Knowledge Graph...</p>
        </div>

        {/* Skeleton Layout - Inspired by Raycast/Linear */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-30">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-muted/50 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-muted/50 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-muted/50 rounded-xl animate-pulse"></div>
            <div className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
            <div className="h-48 bg-muted/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
