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
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { Footer } from "~/components/layout/Footer";

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
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative selection:bg-accent/30 selection:text-white">
      {/* Background decorations */}
      <GeometricDecoration variant="animated" opacity={0.6} />

      {/* Header */}
      <div className="bg-white/[0.02] backdrop-blur-xl border-b border-white/5 py-6 sticky top-0 z-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
              <Link to="/data-explorer">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Topic: {loading ? "Loading..." : topicData?.name}
              </h1>
              <p className="text-accent mt-1 text-sm font-medium opacity-90">Quran Knowledge Graph</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {loading ? (
          <TopicSkeleton />
        ) : error ? (
          <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-xl">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              Error
            </h2>
            <p className="opacity-90">{error}</p>
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
              <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden p-5">
                <h3 className="text-base font-medium mb-4 text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent"></div>
                  Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:text-white hover:border-accent/40 text-white transition-all duration-300 group shadow-sm" asChild>
                    <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})-[r]-(n) RETURN t, r, n LIMIT 20`}>
                      <Network className="h-4 w-4 mr-3 text-accent group-hover:scale-110 transition-transform" />
                      Explore in Graph
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:text-white hover:border-accent/40 text-white transition-all duration-300 group shadow-sm" asChild>
                    <Link to={`/data-explorer?query=MATCH (v:Verse)-[:HAS_TOPIC]->(t:Topic {topic_id: ${topic_id}}) RETURN v, t LIMIT 50`}>
                      <BookOpen className="h-4 w-4 mr-3 text-accent group-hover:scale-110 transition-transform" />
                      View All Verses
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:text-white hover:border-accent/40 text-white transition-all duration-300 group shadow-sm" asChild>
                    <Link to={`/data-explorer?query=MATCH (t:Topic {topic_id: ${topic_id}})--(related:Topic) WHERE t.topic_id <> related.topic_id RETURN t, related LIMIT 50`}>
                      <Tag className="h-4 w-4 mr-3 text-accent group-hover:scale-110 transition-transform" />
                      View Related Topics
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}

// Skeleton component for loading state
function TopicSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-30">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full bg-white/10 rounded-xl" />
          <Skeleton className="h-96 w-full bg-white/10 rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full bg-white/10 rounded-xl" />
          <Skeleton className="h-48 w-full bg-white/10 rounded-xl" />
          <Skeleton className="h-48 w-full bg-white/10 rounded-xl" />
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
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-hidden relative selection:bg-accent/30 selection:text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen opacity-20"></div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl border-b border-white/5 py-6">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
            <Skeleton className="h-8 w-8 bg-white/10 rounded-md" />
            <Skeleton className="h-8 w-48 bg-white/10" />
          </h1>
          <Skeleton className="h-5 w-40 bg-white/10 mt-2" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="relative w-16 h-16 mb-6 mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-accent/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-t-4 border-accent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-medium">Loading topic data...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
