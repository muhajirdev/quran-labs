import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ArrowLeft, BookOpen, Tag, Network } from "lucide-react";

// Import our new components
import { TopicOverview } from "~/components/topic/TopicOverview";
import { TopicHierarchy } from "~/components/topic/TopicHierarchy";
import { TopicRelated } from "~/components/topic/TopicRelated";
import { TopicVerseList } from "~/components/topic/TopicVerseList";
import { TopicExplorer } from "~/components/topic/TopicExplorer";

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

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Construct a Cypher query to get topic details and related data
        const query = `
          MATCH (t:Topic {topic_id: ${topic_id}})
          OPTIONAL MATCH (v:Verse)-[:HAS_TOPIC]->(t)
          OPTIONAL MATCH (t)-[:PARENT_TOPIC]->(parent:Topic)
          OPTIONAL MATCH (child:Topic)-[:PARENT_TOPIC]->(t)

          // Find all topics directly connected to this topic
          OPTIONAL MATCH (t)--(other:Topic)
          WHERE t.topic_id <> other.topic_id

          // Find sibling topics
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
        console.log("API response:", data);

        if (data.data && data.data.length > 0) {
          const topicNode = data.data[0].t;
          const verseNodes = (data.data[0].verses || []).filter((v: any) => v !== null);
          const parentNodes = (data.data[0].parents || []).filter((p: any) => p !== null);
          const childNodes = (data.data[0].children || []).filter((c: any) => c !== null);
          const relatedTopicNodes = (data.data[0].related_topics || []).filter((r: any) => r !== null);
          const siblingNodes = (data.data[0].siblings || []).filter((s: any) => s !== null);

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
              name: r.name,
              description: r.description,
              // WARNING: DUMMY DATA - Replace with actual relevance scores in production
              relevance: Math.random() // Mock relevance score
            })),
            siblings: siblingNodes.map((s: any) => ({
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <TopicSkeleton />
        ) : error ? (
          <div className="p-4 bg-destructive/20 border border-destructive text-destructive rounded-xl">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        ) : topicData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Topic Overview */}
              <TopicOverview
                topic={{
                  ...topicData,
                  verses_count: topicData.verses?.length,
                  related_topics_count: topicData.related_topics?.length
                }}
              />

              {/* Verses List */}
              {topicData.verses && topicData.verses.length > 0 && (
                <TopicVerseList
                  verses={topicData.verses.map(v => ({
                    verse_key: v.verse_key,
                    text: v.text,
                    // WARNING: DUMMY DATA - Replace with actual relevance scores in production
                    relevance: Math.random() // Mock relevance score
                  }))}
                  topicId={topicData.topic_id}
                  topicName={topicData.name}
                />
              )}
            </div>

            {/* Right Column (1/3 width on large screens) */}
            <div className="space-y-6">
              {/* Topic Explorer */}
              <TopicExplorer
                topicId={topicData.topic_id}
                topicName={topicData.name}
              />

              {/* Topic Hierarchy */}
              <TopicHierarchy
                parent={topicData.parent}
                children={topicData.children}
                siblings={topicData.siblings}
                currentTopic={{
                  topic_id: topicData.topic_id,
                  name: topicData.name
                }}
              />

              {/* Related Topics */}
              {topicData.related_topics && topicData.related_topics.length > 0 && (
                <TopicRelated
                  topics={topicData.related_topics.map(t => ({
                    ...t,
                    // WARNING: DUMMY DATA - Replace with actual verse counts in production
                    verses_count: Math.floor(Math.random() * 50) + 1 // Mock verse count
                  }))}
                  currentTopicName={topicData.name}
                />
              )}

              {/* Actions */}
              <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden p-4">
                <h3 className="text-base font-medium mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})-[r]-(n) RETURN t, r, n LIMIT 20`}>
                      <Network className="h-4 w-4 mr-2" />
                      Explore in Graph
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic {topic_id: ${topic_id}}) RETURN v, t LIMIT 50`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      View All Verses
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})--(related:Topic) WHERE t.topic_id <> related.topic_id RETURN t, related LIMIT 50`}>
                      <Tag className="h-4 w-4 mr-2" />
                      View Related Topics
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Skeleton component for loading state
function TopicSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full bg-muted rounded-xl" />
          <Skeleton className="h-96 w-full bg-muted rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full bg-muted rounded-xl" />
          <Skeleton className="h-48 w-full bg-muted rounded-xl" />
          <Skeleton className="h-48 w-full bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Meta function for page metadata
export function meta() {
  return [
    { title: "Topic Detail | Quran Knowledge Graph" },
    { description: "Detailed information about a topic from the Quran Knowledge Graph" },
  ];
}

// HydrateFallback for React Router v7
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
