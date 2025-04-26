import React from 'react';

// Helper function to render cell values based on their type
export function renderCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-600 italic">null</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded border border-gray-300 text-gray-900">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span className="text-gray-900">{String(value)}</span>;
}

// Function to get color based on node label with better contrast
export function getNodeColor(label: string): string {
  const colors: Record<string, string> = {
    Topic: '#2563EB',    // darker blue
    Verse: '#047857',    // darker green
    Chapter: '#D97706',  // darker orange
    Word: '#7E22CE',     // darker purple
    Test: '#DC2626',     // darker red
    // Add more specific colors for different node types
    Surah: '#B45309',    // amber
    Ayah: '#059669',     // emerald
    Translation: '#4F46E5', // indigo
    Tafsir: '#7C3AED',   // violet
    Root: '#BE185D',     // pink
    Concept: '#0369A1'   // light blue
  };

  return colors[label] || '#4B5563'; // darker gray for better contrast
}
