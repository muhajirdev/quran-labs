import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, BookOpen, Hash, MessageSquare, Tag } from "lucide-react";

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

        const data = await response.json();
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
      <div className="bg-card backdrop-blur-xl border-b border-border shadow-lg py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/data-explorer">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Verse {verse_key}</h1>
              <p className="text-primary mt-1">Quran Knowledge Graph</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-muted" />
            <Skeleton className="h-32 w-full bg-muted" />
            <Skeleton className="h-24 w-full bg-muted" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/20 border border-destructive text-destructive rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : verseData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Verse Text Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Verse Text</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      <Hash className="h-3 w-3 mr-1" />
                      {verseData.verse_key}
                    </Badge>
                  </div>
                  <CardDescription>
                    Surah {verseData.surah_number}, Ayah {verseData.ayah_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Arabic</h3>
                    <p className="text-2xl text-right font-arabic leading-loose">{verseData.text}</p>
                  </div>

                  {verseData.translations && verseData.translations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Translations</h3>
                      <div className="space-y-4">
                        {verseData.translations.map((translation, index) => (
                          <div key={index} className="border-l-2 border-primary/50 pl-4 py-1">
                            <p className="text-lg">{translation.text}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {translation.translator} ({translation.language})
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tafsir Card */}
              {verseData.tafsirs && verseData.tafsirs.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      <CardTitle>Tafsir (Exegesis)</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {verseData.tafsirs.map((tafsir, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-lg">{tafsir.author}</h3>
                          <p className="text-muted-foreground text-sm">Language: {tafsir.language}</p>
                          <div className="bg-muted/30 p-4 rounded-lg">
                            <p>{tafsir.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {/* Metadata Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verse Key:</span>
                      <span className="font-medium">{verseData.verse_key}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Surah Number:</span>
                      <span className="font-medium">{verseData.surah_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ayah Number:</span>
                      <span className="font-medium">{verseData.ayah_number}</span>
                    </div>
                    {verseData.juz && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Juz:</span>
                        <span className="font-medium">{verseData.juz}</span>
                      </div>
                    )}
                    {verseData.hizb && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hizb:</span>
                        <span className="font-medium">{verseData.hizb}</span>
                      </div>
                    )}
                    {verseData.page_number && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Page Number:</span>
                        <span className="font-medium">{verseData.page_number}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Topics Card */}
              {verseData.topics && verseData.topics.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <CardTitle>Topics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {verseData.topics.map((topic, index) => (
                        <Link key={index} to={`/topic/${topic.topic_id}`}>
                          <Badge variant="secondary" className="px-3 py-1 hover:bg-secondary/80">
                            {topic.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/data-explorer?query=MATCH (v:Verse {verse_key: "${verse_key}"})-[r]-(n) RETURN v, r, n LIMIT 20`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Explore in Graph
                    </Link>
                  </Button>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Data from Quran Knowledge Graph
                </CardFooter>
              </Card>
            </div>
          </div>
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
      <div className="bg-card backdrop-blur-xl border-b border-border shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Verse Detail</h1>
          <p className="text-primary mt-1">Quran Knowledge Graph</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading verse data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
