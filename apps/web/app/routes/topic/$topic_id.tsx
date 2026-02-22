import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, BookOpen, Tag, Network, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface TopicData {
  topic_id: number;
  name: string;
  arabic_name?: string;
  description?: string;
  parent_id?: number;
  parent?: {
    topic_id: number;
    name: string;
  };
  children?: {
    topic_id: number;
    name: string;
  }[];
  verses?: {
    verse_key: string;
    text: string;
  }[];
  related_topics?: {
    topic_id: number;
    name: string;
    description?: string;
    relevance?: number;
  }[];
  siblings?: {
    topic_id: number;
    name: string;
  }[];
}

export default function TopicDetailPage() {
  const { topic_id } = useParams();
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllVerses, setShowAllVerses] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const query = `
          MATCH (t:Topic {topic_id: ${topic_id}})
          OPTIONAL MATCH (v:Verse)-[:HAS_TOPIC]->(t)
          OPTIONAL MATCH (t)-[:PARENT_TOPIC]->(parent:Topic)
          OPTIONAL MATCH (child:Topic)-[:PARENT_TOPIC]->(t)
          OPTIONAL MATCH (t)--(other:Topic)
          WHERE t.topic_id <> other.topic_id
          OPTIONAL MATCH (sibling:Topic)-[:PARENT_TOPIC]->(parent)
          WHERE sibling.topic_id <> t.topic_id
          RETURN t,
                 collect(distinct v) as verses,
                 collect(distinct parent) as parents,
                 collect(distinct child) as children,
                 collect(distinct other) as related_topics,
                 collect(distinct sibling) as siblings
        `;

        const response = await fetch('https://kuzu-api.fly.dev/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch topic data');
        }

        const data = await response.json() as any;

        if (data.data && data.data.length > 0) {
          const topicNode = data.data[0].t;
          const verseNodes = (data.data[0].verses || []).filter((v: any) => v !== null);
          const parentNodes = (data.data[0].parents || []).filter((p: any) => p !== null);
          const childNodes = (data.data[0].children || []).filter((c: any) => c !== null);
          const relatedTopicNodes = (data.data[0].related_topics || []).filter((r: any) => r !== null);
          const siblingNodes = (data.data[0].siblings || []).filter((s: any) => s !== null);

          const processedData: TopicData = {
            topic_id: topicNode.topic_id,
            name: topicNode.name,
            arabic_name: topicNode.arabic_name,
            description: topicNode.description,
            parent_id: topicNode.parent_id,
            verses: verseNodes.map((v: any) => ({
              verse_key: v.verse_key,
              text: v.text || v.text_uthmani
            })),
            parent: parentNodes.length > 0 ? {
              topic_id: parentNodes[0].topic_id,
              name: parentNodes[0].name
            } : undefined,
            children: childNodes.map((c: any) => ({
              topic_id: c.topic_id,
              name: c.name
            })),
            related_topics: relatedTopicNodes.slice(0, 6).map((r: any) => ({
              topic_id: r.topic_id,
              name: r.name,
              description: r.description,
            })),
            siblings: siblingNodes.slice(0, 5).map((s: any) => ({
              topic_id: s.topic_id,
              name: s.name
            }))
          };

          setTopicData(processedData);
        } else {
          setError('Topic not found');
        }
      } catch (err) {
        console.error('Error fetching topic data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (topic_id) {
      fetchData();
    }
  }, [topic_id]);

  const displayedVerses = showAllVerses 
    ? topicData?.verses 
    : topicData?.verses?.slice(0, 3);

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
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">
                {loading ? "Loading..." : topicData?.name}
              </h1>
              {topicData?.arabic_name && (
                <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                  {topicData.arabic_name}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <TopicSkeleton />
        ) : error ? (
          <div className="p-6 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : topicData ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Topic Identity - Hero Section */}
            <section>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{topicData.name}</h2>
                  {topicData.arabic_name && (
                    <p className="text-2xl text-muted-foreground font-arabic" dir="rtl">
                      {topicData.arabic_name}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0">
                  {topicData.verses?.length || 0} verses
                </Badge>
              </div>
              
              {topicData.description ? (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {topicData.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No description available.</p>
              )}

              {/* Breadcrumb */}
              {(topicData.parent || topicData.children?.length) && (
                <div className="flex flex-wrap items-center gap-2 mt-6 text-sm">
                  {topicData.parent && (
                    <>
                      <Link 
                        to={`/topic/${topicData.parent.topic_id}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {topicData.parent.name}
                      </Link>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                  <span className="font-medium">{topicData.name}</span>
                  {topicData.children && topicData.children.length > 0 && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">
                        {topicData.children.length} subtopics
                      </span>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* Key Verses - Primary Content */}
            {topicData.verses && topicData.verses.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Key Verses
                  </h3>
                </div>

                <div className="space-y-3">
                  {displayedVerses?.map((verse) => (
                    <Link
                      key={verse.verse_key}
                      to={`/verse/${verse.verse_key}`}
                      className="block p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {verse.verse_key}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">
                        {verse.text}
                      </p>
                    </Link>
                  ))}
                </div>

                {topicData.verses.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAllVerses(!showAllVerses)}
                    className="w-full"
                  >
                    {showAllVerses 
                      ? "Show fewer verses" 
                      : `Show all ${topicData.verses.length} verses`
                    }
                  </Button>
                )}
              </section>
            )}

            {/* Secondary Content - Collapsible */}
            <Accordion type="multiple" className="space-y-2">
              {/* Related Topics */}
              {topicData.related_topics && topicData.related_topics.length > 0 && (
                <AccordionItem value="related" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Related Topics</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {topicData.related_topics.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="flex flex-wrap gap-2">
                      {topicData.related_topics.map((topic) => (
                        <Link
                          key={topic.topic_id}
                          to={`/topic/${topic.topic_id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                        >
                          {topic.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Subtopics */}
              {topicData.children && topicData.children.length > 0 && (
                <AccordionItem value="children" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-primary" />
                      <span>Subtopics</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {topicData.children.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-2">
                      {topicData.children.map((child) => (
                        <Link
                          key={child.topic_id}
                          to={`/topic/${child.topic_id}`}
                          className="block p-3 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-muted/30 transition-all"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Sibling Topics */}
              {topicData.siblings && topicData.siblings.length > 0 && (
                <AccordionItem value="siblings" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>Related Topics</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {topicData.siblings.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="flex flex-wrap gap-2">
                      {topicData.siblings.map((sibling) => (
                        <Link
                          key={sibling.topic_id}
                          to={`/topic/${sibling.topic_id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm transition-colors"
                        >
                          {sibling.name}
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            {/* Actions */}
            <section className="pt-4 border-t border-border">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})-[r]-(n) RETURN t, r, n LIMIT 20`}>
                    <Network className="h-4 w-4 mr-2" />
                    View in Graph
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic {topic_id: ${topic_id}}) RETURN v, t LIMIT 50`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    All Verses
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function TopicSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Topic Detail | Quran Knowledge Graph" },
    { description: "Detailed information about a topic from the Quran Knowledge Graph" },
  ];
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <TopicSkeleton />
      </main>
    </div>
  );
}
