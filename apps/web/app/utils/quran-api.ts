/**
 * Utility functions for fetching Quran data from the Kuzu API
 */

const API_ENDPOINT = 'https://kuzu-api.fly.dev/query';

/**
 * Execute a Cypher query against the Kuzu API
 */
export async function executeQuery(query: string) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

/**
 * Get all chapters (surahs) from the Quran
 */
export async function getChapters() {
  const query = `
    MATCH (c:Chapter)
    RETURN c.id, c.chapter_number, c.name_english, c.name_arabic, 
           c.revelation_place, c.verses_count
    ORDER BY c.chapter_number
  `;
  
  const result = await executeQuery(query);
  return result.data || [];
}

/**
 * Get verses for a specific chapter
 */
export async function getVersesByChapter(chapterNumber: number, language = 'en') {
  const query = `
    MATCH (c:Chapter {chapter_number: ${chapterNumber}})-[:CONTAINS]->(v:Verse)
    OPTIONAL MATCH (v)-[rtr:HAS_TRANSLATION]->(tr:Translation {language: "${language}"})
    RETURN v.id, v.verse_key, v.verse_number, v.text_uthmani, 
           collect(distinct tr) as translations
    ORDER BY v.verse_number
  `;
  
  const result = await executeQuery(query);
  return result.data || [];
}

/**
 * Get a specific verse by its key (e.g., "1:1")
 */
export async function getVerseByKey(verseKey: string, language = 'en') {
  const query = `
    MATCH (v:Verse {verse_key: "${verseKey}"})
    OPTIONAL MATCH (v)-[r:HAS_TOPIC]->(t:Topic)
    OPTIONAL MATCH (v)-[rt:HAS_TAFSIR]->(tf:Tafsir)
    OPTIONAL MATCH (v)-[rtr:HAS_TRANSLATION]->(tr:Translation {language: "${language}"})
    RETURN v, collect(distinct t) as topics, collect(distinct tf) as tafsirs, collect(distinct tr) as translations
  `;
  
  const result = await executeQuery(query);
  return result.data && result.data.length > 0 ? result.data[0] : null;
}
