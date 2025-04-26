import React from 'react';

interface ExampleQueriesProps {
  setQuery: (query: string) => void;
}

export function ExampleQueries({ setQuery }: ExampleQueriesProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Example Queries</h2>
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-medium text-gray-800 border-b border-gray-300">
            Basic Queries
          </div>
          <div className="divide-y divide-gray-200">
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (t:Topic) RETURN t LIMIT 10')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Get Topics</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (t:Topic) RETURN t LIMIT 10</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Get Verses by Surah</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (v:Verse) WHERE v.surah_number = 99 RETURN v</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Search Topics</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">MATCH (t:Topic) WHERE t.name CONTAINS "atom" RETURN t</pre>
            </div>
          </div>
        </div>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 font-medium text-gray-800 border-b border-gray-300">
            Graph Visualization Queries
          </div>
          <div className="divide-y divide-gray-200">
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.verse_key = "99:7" RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Topics for a Specific Verse</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) 
WHERE v.verse_key = "99:7" 
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.name = "Atom" RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Topics by Name</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) 
WHERE t.name = "Atom" 
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE v.surah_number = 99 RETURN v, h, t')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Verse-Topic Relationships</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) 
WHERE v.surah_number = 99 
RETURN v, h, t`}</pre>
            </div>
            <div
              className="p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setQuery('MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) WHERE t.topic_id IN [394, 1287, 1428] RETURN v, h, t LIMIT 30')}
            >
              <h3 className="font-medium mb-1 text-gray-900">Multiple Topics</h3>
              <pre className="text-xs bg-gray-200 p-2 rounded border border-gray-300 text-gray-900">{`MATCH (v:Verse)-[h:HAS_TOPIC]->(t:Topic) 
WHERE t.topic_id IN [394, 1287, 1428] 
RETURN v, h, t LIMIT 30`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
