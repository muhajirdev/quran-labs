import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, Tag, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

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

        if (data.data && data.data.length > 0) {
          const verseNode = data.data[0].v;
          const topicsNodes = data.data[0].topics.filter((t: any) => t !== null);
          const tafsirNodes = data.data[0].tafsirs.filter((t: any) => t !== null);
          const translationNodes = data.data[0].translations.filter((t: any) => t !== null);

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

  // Get primary translation (English preferred, otherwise first available)
  const primaryTranslation = verseData?.translations?.find(t => 
    t.language.toLowerCase() === 'english'
  ) || verseData?.translations?.[0];

  // Get additional translations (excluding primary)
  const additionalTranslations = verseData?.translations?.filter(t => 
    t.id !== primaryTranslation?.id
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link to="/data-explorer">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                Surah {verseData?.surah_number || '...'}, Ayah {verseData?.ayah_number || '...'}
              </h1>
              <p className="text-sm text-muted-foreground">{verse_key}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {verseData?.juz && <span>Juz {verseData.juz}</span>}
              {verseData?.page_number && <span>Page {verseData.page_number}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <VerseSkeleton />
        ) : error ? (
          <div className="p-6 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : verseData ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section - Arabic + Primary Translation */}
            <section className="text-center space-y-6 py-8">
              {/* Arabic Text */}
              <div className="space-y-4">
                <p 
                  className="text-3xl md:text-4xl font-arabic leading-loose" 
                  dir="rtl" 
                  lang="ar"
                >
                  {verseData.text}
                </p>
              </div>

              {/* Primary Translation */}
              {primaryTranslation && (
                <div className="max-w-2xl mx-auto space-y-3 pt-4 border-t border-border">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {primaryTranslation.text}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-muted-foreground">{primaryTranslation.translator}</span>
                    <Badge variant="outline" className="text-xs">
                      {primaryTranslation.language}
                    </Badge>
                  </div>
                </div>
              )}
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Translations & Tafsir */}
              <div className="lg:col-span-2 space-y-6">
                {/* Additional Translations */}
                {additionalTranslations.length > 0 && (
                  <Accordion type="single" collapsible className="border rounded-lg">
                    <AccordionItem value="translations" className="border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span>More Translations</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {additionalTranslations.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {additionalTranslations.map((translation) => (
                            <div 
                              key={translation.id} 
                              className="p-4 rounded-lg bg-muted/30 space-y-2"
                            >
                              <p className="text-sm leading-relaxed">{translation.text}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{translation.translator}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {translation.language}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Tafsir / Commentary */}
                {verseData.tafsirs && verseData.tafsirs.length > 0 && (
                  <Accordion type="single" collapsible className="border rounded-lg">
                    <AccordionItem value="tafsir" className="border-0">
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span>Commentary (Tafsir)</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {verseData.tafsirs.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {verseData.tafsirs.map((tafsir, index) => (
                            <div 
                              key={index} 
                              className="p-4 rounded-lg bg-muted/30 space-y-3"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-medium text-primary">
                                    {tafsir.author.charAt(0)}
                                  </span>
                                </div>
                                <span className="font-medium text-sm">{tafsir.author}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {tafsir.language}
                                </Badge>
                              </div>
                              <div 
                                className="prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: tafsir.text }}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>

              {/* Right Column - Topics & Actions */}
              <div className="space-y-6">
                {/* Topics */}
                {verseData.topics && verseData.topics.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {verseData.topics.map((topic, index) => (
                        <Link
                          key={index}
                          to={`/topic/${topic.topic_id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                        >
                          {topic.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surah</span>
                      <span>{verseData.surah_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ayah</span>
                      <span>{verseData.ayah_number}</span>
                    </div>
                    {verseData.juz && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Juz</span>
                        <span>{verseData.juz}</span>
                      </div>
                    )}
                    {verseData.page_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Page</span>
                        <span>{verseData.page_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`}>
                      View in Knowledge Graph
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic)<-[:HAS_TOPIC]-(v2:Verse) WHERE v.verse_key = "${verse_key}" AND v2 <> v RETURN v, v2, t LIMIT 30`}>
                      Find Related Verses
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function VerseSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
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
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <VerseSkeleton />
      </main>
    </div>
  );
}
