import { useState } from 'react';

interface QueryItem {
  id: number;
  title: string;
  description: string;
  query: string;
}

export default function Explore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [queries] = useState<QueryItem[]>([
    {
      id: 1,
      title: 'Find Surah Al-Baqarah',
      description: 'Query to find all verses from Surah Al-Baqarah',
      query: 'SELECT * FROM quran WHERE surah = 2'
    },
    {
      id: 2,
      title: 'Search by Topic: Prayer',
      description: 'Find verses related to prayer (salah)',
      query: 'SELECT * FROM quran WHERE text LIKE "%prayer%"'
    },
    {
      id: 3,
      title: 'Verses about Patience',
      description: 'Find verses that discuss patience (sabr)',
      query: 'SELECT * FROM quran WHERE text LIKE "%patient%"'
    }
  ]);

  const handleCopyQuery = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      alert('Query copied!');
    } catch (err) {
      console.error('Failed to copy query:', err);
      alert('Failed to copy query');
    }
  };

  const filteredQueries = queries.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Main Content - iframe */}
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'w-full' : 'w-[calc(100%-400px)]'}`}>
        <iframe
          src="http://localhost:8000"
          className="w-full h-full border-0"
          title="External Content"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>

      {/* Toggle Button - Separated from panel */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'right-10 translate-x-1/2' : 'right-[400px] -translate-x-1/2'
        } bg-white border border-gray-200 rounded-full p-1.5 shadow-md z-50 hover:bg-gray-50`}
        title={isCollapsed ? "Show queries" : "Hide queries"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-600 transform transition-transform duration-300 ${isCollapsed ? '' : '-rotate-180'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Right Panel */}
      <div 
        className={`fixed right-0 top-0 h-full transition-transform duration-300 ease-in-out ${isCollapsed ? 'translate-x-full' : 'translate-x-0'} w-[400px] border-l border-gray-200 bg-white flex flex-col`}
      >
        <h1 className="text-xl font-bold p-4 text-gray-900 border-b border-gray-200">Explore Queries</h1>
        
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {filteredQueries.map((item) => (
            <div key={item.id} className="p-4">
              <h2 className="text-lg font-semibold mb-1 text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              
              <div className="bg-gray-50 p-3 rounded-md relative group">
                <pre className="overflow-x-auto">
                  <code className="text-sm text-gray-800 font-mono">{item.query}</code>
                </pre>
                <button
                  onClick={() => handleCopyQuery(item.query)}
                  className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Copy query"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                    <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
