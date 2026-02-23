import React from 'react';

interface ExampleQueriesProps {
  setQuery: (query: string) => void;
}

export function ExampleQueries({ setQuery }: ExampleQueriesProps) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border backdrop-blur-xl">
      <h2 className="text-lg font-semibold mb-4 text-foreground">Example Queries</h2>
      <div className="space-y-4">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/20 px-4 py-2 font-medium text-foreground border-b border-border">
            Basic Queries
          </div>
          <div className="divide-y divide-border">
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (t:Topic) RETURN t LIMIT 10')}
            >
              <h3 className="font-medium mb-1 text-foreground">Get Topics</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (t:Topic) RETURN t LIMIT 10`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v')}
            >
              <h3 className="font-medium mb-1 text-foreground">Get Verses by Surah</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t')}
            >
              <h3 className="font-medium mb-1 text-foreground">Search Topics</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t`}</pre>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-secondary/20 px-4 py-2 font-medium text-foreground border-b border-border">
            Graph Visualization Queries
          </div>
          <div className="divide-y divide-border">
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-foreground">Topics for a Specific Verse</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE v.verse_key = "99:7"
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.name = "Atom" RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-foreground">Topics by Name</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE t.name = "Atom"
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.surah_number = 99 RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-foreground">Verse-Topic Relationships</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE v.surah_number = 99
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.topic_id IN [394, 1287, 1428] RETURN v, h, t LIMIT 30')}
            >
              <h3 className="font-medium mb-1 text-foreground">Multiple Topics</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic)
WHERE t.topic_id IN [394, 1287, 1428]
RETURN v, h, t LIMIT 30`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (t:Topic {name: "Privacy"})<-[h1:HAS_TOPIC]-(v:Verse)-[h2:HAS_TOPIC]->(related:Topic) WHERE related <> t RETURN t, related, h2, h1, v')}
            >
              <h3 className="font-medium mb-1 text-foreground">Related Topics</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (t:Topic {name: "Privacy"})<-[h1:HAS_TOPIC]-(v:Verse)-[h2:HAS_TOPIC]->(related:Topic)
WHERE related <> t
RETURN t, related, h2, h1, v`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic {name: "Privacy"}) RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-foreground">Verses About Privacy</h3>
              <pre className="text-xs bg-background/50 p-2 rounded border border-border text-foreground">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic {name: "Privacy"})
RETURN v, h, t`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
