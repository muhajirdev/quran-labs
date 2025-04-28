import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, BookOpen, Hash, Tag, BookMarked } from "lucide-react";

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
  }[];
}

export default function TopicDetailPage() {
  const { topic_id } = useParams();
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTopicData() {
      setLoading(true);
      setError(null);

      try {
        // Construct a Cypher query to get topic details and related data
        const query = `
          MATCH (t:Topic {topic_id: ${topic_id}})
          OPTIONAL MATCH (v:Verse)-[r:HAS_TOPIC]->(t)
          OPTIONAL MATCH (t)-[p:PARENT_TOPIC]->(parent:Topic)
          OPTIONAL MATCH (child:Topic)-[c:PARENT_TOPIC]->(t)
          OPTIONAL MATCH (t)-[rt:RELATED_TO]->(related:Topic)
          RETURN t,
                 collect(distinct v) as verses,
                 collect(distinct parent) as parents,
                 collect(distinct child) as children,
                 collect(distinct related) as related_topics
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

        const data = await response.json();
        console.log("API response:", data);

        if (data.data && data.data.length > 0) {
          const topicNode = data.data[0].t;
          const verseNodes = data.data[0].verses.filter((v: any) => v !== null);
          const parentNodes = data.data[0].parents.filter((p: any) => p !== null);
          const childNodes = data.data[0].children.filter((c: any) => c !== null);
          const relatedTopicNodes = data.data[0].related_topics.filter((r: any) => r !== null);

          // Process the topic data
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
            related_topics: relatedTopicNodes.map((r: any) => ({
              topic_id: r.topic_id,
              name: r.name
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
      fetchTopicData();
    }
  }, [topic_id]);

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
              <h1 className="text-3xl font-bold text-foreground">
                Topic: {loading ? "Loading..." : topicData?.name}
              </h1>
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
        ) : topicData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Topic Overview Card */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Topic Overview</CardTitle>
                    <Badge variant="outline" className="text-sm">
                      <Hash className="h-3 w-3 mr-1" />
                      ID: {topicData.topic_id}
                    </Badge>
                  </div>
                  {topicData.arabic_name && (
                    <CardDescription>
                      Arabic: {topicData.arabic_name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  {topicData.description ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{topicData.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">No description available</p>
                  )}
                </CardContent>
              </Card>

              {/* Verses Card */}
              {topicData.verses && topicData.verses.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookMarked className="h-5 w-5 text-primary" />
                      <CardTitle>Related Verses</CardTitle>
                    </div>
                    <CardDescription>
                      Verses that address this topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topicData.verses.slice(0, 10).map((verse, index) => (
                        <div key={index} className="border-l-2 border-primary/50 pl-4 py-1">
                          <Link to={`/verse/${verse.verse_key}`} className="hover:underline">
                            <h3 className="font-medium text-lg">{verse.verse_key}</h3>
                          </Link>
                          <p className="mt-1 text-sm line-clamp-2">{verse.text}</p>
                        </div>
                      ))}
                      {topicData.verses.length > 10 && (
                        <div className="text-center mt-4">
                          <Button variant="outline" asChild>
                            <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic {topic_id: ${topic_id}}) RETURN v, t LIMIT 50`}>
                              View All {topicData.verses.length} Verses
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {/* Hierarchy Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Topic Hierarchy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topicData.parent && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Parent Topic:</h3>
                      <Link to={`/topic/${topicData.parent.topic_id}`}>
                        <Badge variant="outline" className="px-3 py-1 hover:bg-secondary/80">
                          {topicData.parent.name}
                        </Badge>
                      </Link>
                    </div>
                  )}

                  {topicData.children && topicData.children.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Child Topics:</h3>
                      <div className="flex flex-wrap gap-2">
                        {topicData.children.map((child, index) => (
                          <Link key={index} to={`/topic/${child.topic_id}`}>
                            <Badge variant="secondary" className="px-3 py-1 hover:bg-secondary/80">
                              {child.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!topicData.parent && (!topicData.children || topicData.children.length === 0)) && (
                    <p className="text-muted-foreground italic">No hierarchy information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Related Topics Card */}
              {topicData.related_topics && topicData.related_topics.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      <CardTitle>Related Topics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {topicData.related_topics.map((topic, index) => (
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
                    <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})-[r]-(n) RETURN t, r, n LIMIT 20`}>
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
    { title: "Topic Detail | Quran Knowledge Graph" },
    { description: "Detailed information about a topic from the Quran Knowledge Graph" },
  ];
}

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card backdrop-blur-xl border-b border-border shadow-lg py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground">Topic Detail</h1>
          <p className="text-primary mt-1">Quran Knowledge Graph</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-muted-foreground mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading topic data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
