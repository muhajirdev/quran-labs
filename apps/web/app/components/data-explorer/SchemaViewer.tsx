import { useState } from 'react';
import type { SchemaData } from '~/components/data-explorer/types';

interface SchemaViewerProps {
  schema: SchemaData | null;
  loading: boolean;
  setQuery: (query: string) => void;
}

export function SchemaViewer({ schema, loading, setQuery }: SchemaViewerProps) {
  const [expandedNodeTables, setExpandedNodeTables] = useState<Set<string>>(new Set());
  const [expandedRelTables, setExpandedRelTables] = useState<Set<string>>(new Set());
  const [showNodeTables, setShowNodeTables] = useState(true);
  const [showRelTables, setShowRelTables] = useState(true);

  const toggleNodeTable = (tableName: string) => {
    const newSet = new Set(expandedNodeTables);
    if (newSet.has(tableName)) {
      newSet.delete(tableName);
    } else {
      newSet.add(tableName);
    }
    setExpandedNodeTables(newSet);
  };

  const toggleRelTable = (tableName: string) => {
    const newSet = new Set(expandedRelTables);
    if (newSet.has(tableName)) {
      newSet.delete(tableName);
    } else {
      newSet.add(tableName);
    }
    setExpandedRelTables(newSet);
  };

  const generateNodeQuery = (tableName: string) => {
    setQuery(`MATCH (n:${tableName}) RETURN n LIMIT 10`);
  };

  const generateRelQuery = (tableName: string, connectivity: { src: string; dst: string }[]) => {
    if (connectivity && connectivity.length > 0) {
      const { src, dst } = connectivity[0];
      setQuery(`MATCH (a:${src})-[r:${tableName}]->(b:${dst}) RETURN a, r, b LIMIT 10`);
    } else {
      setQuery(`MATCH ()-[r:${tableName}]->() RETURN r LIMIT 10`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300 animate-pulse">
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-5/6"></div>
          <div className="h-5 bg-gray-200 rounded w-4/6"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Database Schema</h2>
        <div className="p-4 bg-gray-100 rounded-lg text-gray-700 font-medium border border-gray-300">
          Schema information not available. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
      <h2 className="text-xl font-bold mb-5 text-gray-900 border-b border-gray-200 pb-3">Database Schema</h2>

      {/* Node Tables Section */}
      <div className="mb-4">
        <div
          className="flex items-center justify-between cursor-pointer bg-gray-200 p-3 rounded-lg mb-2"
          onClick={() => setShowNodeTables(!showNodeTables)}
        >
          <h3 className="font-semibold text-gray-900 text-base">Node Tables ({schema.nodeTables.length})</h3>
          <svg
            className={`h-5 w-5 text-gray-800 transform transition-transform ${showNodeTables ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showNodeTables && (
          <div className="space-y-2 ml-2">
            {schema.nodeTables.map((table) => (
              <div key={table.name} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="flex items-center justify-between cursor-pointer bg-blue-100 p-3 hover:bg-blue-200 border border-blue-300 rounded-t-lg"
                  onClick={() => toggleNodeTable(table.name)}
                >
                  <div className="font-semibold text-blue-900 text-base">{table.name}</div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateNodeQuery(table.name);
                      }}
                      className="text-sm bg-blue-700 text-white px-3 py-1 rounded-md mr-3 hover:bg-blue-800 font-medium"
                    >
                      Query
                    </button>
                    <svg
                      className={`h-5 w-5 text-blue-800 transform transition-transform ${expandedNodeTables.has(table.name) ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedNodeTables.has(table.name) && (
                  <div className="p-3 bg-white border-t border-gray-300">
                    <div className="text-sm font-medium text-gray-800 mb-2">Properties:</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-900">Primary Key</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.properties.map((prop) => (
                            <tr key={prop.name} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{prop.name}</td>
                              <td className="px-3 py-2 text-gray-800">{prop.type}</td>
                              <td className="px-3 py-2 text-gray-800">{prop.isPrimaryKey ? '✓' : ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relationship Tables Section */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer bg-gray-200 p-3 rounded-lg mb-2"
          onClick={() => setShowRelTables(!showRelTables)}
        >
          <h3 className="font-semibold text-gray-900 text-base">Relationship Tables ({schema.relTables.length})</h3>
          <svg
            className={`h-5 w-5 text-gray-800 transform transition-transform ${showRelTables ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {showRelTables && (
          <div className="space-y-2 ml-2">
            {schema.relTables.map((table) => (
              <div key={table.name} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div
                  className="flex items-center justify-between cursor-pointer bg-purple-100 p-3 hover:bg-purple-200 border border-purple-300 rounded-t-lg"
                  onClick={() => toggleRelTable(table.name)}
                >
                  <div className="font-semibold text-purple-900 text-base">{table.name}</div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateRelQuery(table.name, table.connectivity);
                      }}
                      className="text-sm bg-purple-700 text-white px-3 py-1 rounded-md mr-3 hover:bg-purple-800 font-medium"
                    >
                      Query
                    </button>
                    <svg
                      className={`h-5 w-5 text-purple-800 transform transition-transform ${expandedRelTables.has(table.name) ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedRelTables.has(table.name) && (
                  <div className="p-3 bg-white border-t border-gray-300">
                    {table.connectivity && table.connectivity.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-800 mb-2">Connectivity:</div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="px-3 py-2 text-left font-semibold text-gray-900">Source</th>
                                <th className="px-3 py-2 text-left font-semibold text-gray-900">Destination</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.connectivity.map((conn, idx) => (
                                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-900">{conn.src}</td>
                                  <td className="px-3 py-2 font-medium text-gray-900">{conn.dst}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="text-sm font-medium text-gray-800 mb-2">Properties:</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-3 py-2 text-left font-semibold text-gray-900">Name</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.properties.map((prop) => (
                            <tr key={prop.name} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{prop.name}</td>
                              <td className="px-3 py-2 text-gray-800">{prop.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
