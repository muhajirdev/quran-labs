/**
 * Lyrics API utilities with Cloudflare KV caching
 *
 * This module provides functions for fetching song lyrics from external APIs with caching.
 */

import { z } from 'zod';
import { parse } from 'node-html-parser';

// Genius API access token
const GENIUS_ACCESS_TOKEN = "shU6DraV3Yl9AwdLhG36vCwUoYTbsSV0V3qWyy3keapRqWJ87CsPeZY2XcUeZGEf";

// Cache TTL (Time To Live) in seconds - 1 year for lyrics
const CACHE_TTL = 365 * 24 * 60 * 60; // 1 year

// Define the schema for the lyrics API response
export const LyricsResponseSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  url: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  error: z.string().optional(),
});

// Define the schema for the lyrics.ovh API response
export const LyricsOvhResponseSchema = z.object({
  lyrics: z.string(),
});

// Define the schema for the Genius API search response
export const GeniusSearchResponseSchema = z.object({
  response: z.object({
    hits: z.array(z.object({
      result: z.object({
        id: z.number(),
        title: z.string(),
        primary_artist: z.object({
          name: z.string(),
        }),
        url: z.string(),
        song_art_image_url: z.string().optional(),
      })
    }))
  })
});

// Type for the lyrics API response
export type LyricsResponse = z.infer<typeof LyricsResponseSchema>;

/**
 * Generates a cache key for lyrics
 *
 * @param title - The song title
 * @param artist - The artist name
 * @returns A cache key string
 */
function generateCacheKey(title: string, artist: string): string {
  // Normalize the key to handle case and spacing variations
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '-');
  const normalizedArtist = artist.toLowerCase().trim().replace(/\s+/g, '-');
  return `lyrics:${normalizedArtist}:${normalizedTitle}`;
}

/**
 * Retrieves lyrics from Cloudflare KV cache
 *
 * @param kv - Cloudflare KV namespace
 * @param title - The song title
 * @param artist - The artist name
 * @returns Cached lyrics response or null if not found
 */
async function getCachedLyrics(kv: KVNamespace, title: string, artist: string): Promise<LyricsResponse | null> {
  try {
    const cacheKey = generateCacheKey(title, artist);
    console.log('Checking cache for key:', cacheKey);
    
    const cachedData = await kv.get(cacheKey, 'json');
    
    if (cachedData) {
      console.log('Cache hit for lyrics');
      // Validate cached data
      const validatedData = LyricsResponseSchema.parse(cachedData);
      return validatedData;
    }
    
    console.log('Cache miss for lyrics');
    return null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

/**
 * Stores lyrics in Cloudflare KV cache
 *
 * @param kv - Cloudflare KV namespace
 * @param title - The song title
 * @param artist - The artist name
 * @param lyricsData - The lyrics response to cache
 */
async function cacheLyrics(kv: KVNamespace, title: string, artist: string, lyricsData: LyricsResponse): Promise<void> {
  try {
    // Only cache successful results (non-empty lyrics)
    if (!lyricsData.lyrics || lyricsData.lyrics.trim().length === 0 || lyricsData.error) {
      console.log('Skipping cache for empty/error result');
      return;
    }

    const cacheKey = generateCacheKey(title, artist);
    console.log('Caching lyrics with key:', cacheKey);
    
    await kv.put(cacheKey, JSON.stringify(lyricsData), {
      expirationTtl: CACHE_TTL,
    });
    
    console.log('Successfully cached lyrics');
  } catch (error) {
    console.error('Error caching lyrics:', error);
    // Don't throw - caching failures shouldn't break the API
  }
}

/**
 * Scrapes lyrics from a Genius URL using node-html-parser
 * WARNING: This may violate Genius Terms of Service. Use at your own risk.
 *
 * @param geniusUrl - The Genius URL to scrape
 * @returns The lyrics text or null if scraping fails
 */
async function scrapeLyricsFromGenius(geniusUrl: string): Promise<string | null> {
  try {
    console.log('Scraping lyrics from Genius URL:', geniusUrl);

    const response = await fetch(geniusUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      console.log(`Failed to fetch Genius page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Parse the HTML using node-html-parser
    const root = parse(html);
    
    // Target the specific path: #lyrics-root > div.Lyrics__Container-sc-3d1d18a3-1.bjajog > p
    const lyricsRoot = root.querySelector('#lyrics-root');
    
    if (!lyricsRoot) {
      console.log('lyrics-root not found');
      return null;
    }

    // Look for the specific Lyrics__Container class
    const lyricsContainer = lyricsRoot.querySelector('div.Lyrics__Container-sc-3d1d18a3-1.bjajog');
    
    if (!lyricsContainer) {
      console.log('Lyrics__Container not found');
      return null;
    }

    // Get all paragraph elements within the container
    const paragraphs = lyricsContainer.querySelectorAll('p');
    
    if (paragraphs.length === 0) {
      console.log('No paragraphs found, trying to extract text content directly');
      
      // Parse the container content with node-html-parser
      const containerRoot = parse(lyricsContainer.innerHTML);
      
      // Remove UI elements using DOM methods
      containerRoot.querySelectorAll('div[class*="LyricsHeader"]').forEach(el => el.remove());
      containerRoot.querySelectorAll('div[class]').forEach(el => el.remove());
      containerRoot.querySelectorAll('button').forEach(el => el.remove());
      containerRoot.querySelectorAll('span[class]').forEach(el => el.remove());
      containerRoot.querySelectorAll('svg').forEach(el => el.remove());
      containerRoot.querySelectorAll('path').forEach(el => el.remove());
      containerRoot.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => el.remove());
      
      // Get the remaining content and convert <br> to newlines
      let cleanedContent = containerRoot.innerHTML;
      cleanedContent = cleanedContent.replace(/<br\s*\/?>/gi, '\n');
      
      // Parse again to get clean text
      const textRoot = parse(cleanedContent);
      let textContent = textRoot.text
        .replace(/\n\s*\n/g, '\n\n')  // Normalize double line breaks
        .replace(/^\s+|\s+$/g, '')     // Trim whitespace
        .trim();
      
      if (textContent.length > 10) {
        console.log('Successfully extracted pure lyrics using DOM manipulation');
        console.log('Extracted lyrics preview:', textContent.substring(0, 200) + '...');
        return textContent;
      }
      
      console.log('No lyrics content found after cleaning');
      return null;
    }

    console.log(`Found ${paragraphs.length} paragraph(s) in lyrics container`);
    
    let allLyrics = '';
    
    for (const paragraph of paragraphs) {
      // Get the HTML content to preserve <br> tags
      let content = paragraph.innerHTML;
      
      // Replace <br> tags with newlines
      content = content.replace(/<br\s*\/?>/gi, '\n');
      
      // Parse and get clean text
      const tempRoot = parse(content);
      const textContent = tempRoot.text.trim();
      
      if (textContent.length > 0) {
        allLyrics += textContent + '\n';
      }
    }
    
    if (allLyrics.trim().length > 10) {
      console.log('Successfully scraped lyrics from paragraphs');
      return allLyrics.trim();
    }

    console.log('No lyrics content found');
    return null;

  } catch (error) {
    console.error('Error scraping Genius lyrics:', error);
    return null;
  }
}

/**
 * Fetches lyrics from the Genius API as a fallback
 *
 * @param title - The title of the song
 * @param artist - The artist name
 * @returns The lyrics data or null if not found
 */
async function fetchLyricsFromGenius(title: string, artist: string): Promise<LyricsResponse | null> {
  try {
    // Search for the song on Genius
    const searchQuery = `${artist} ${title}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://api.genius.com/search?q=${encodedQuery}`;
    
    console.log('Trying Genius API search:', searchUrl);

    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!searchResponse.ok) {
      console.log(`Genius search API failed with status ${searchResponse.status}`);
      return null;
    }

    const searchData = await searchResponse.json();
    console.log('Genius search data:', searchData);

    // Validate the search response
    const validatedSearchData = GeniusSearchResponseSchema.parse(searchData);
    
    if (validatedSearchData.response.hits.length === 0) {
      console.log('No results found on Genius');
      return null;
    }

    // Get the first result
    const firstHit = validatedSearchData.response.hits[0].result;
    
    // Try to scrape the actual lyrics from the Genius page
    const scrapedLyrics = await scrapeLyricsFromGenius(firstHit.url);
    
    if (scrapedLyrics) {
      return {
        title: firstHit.title,
        artist: firstHit.primary_artist.name,
        lyrics: scrapedLyrics,
        url: firstHit.url,
        thumbnail: firstHit.song_art_image_url
      };
    }

    // If scraping failed, return the URL as before
    return {
      title: firstHit.title,
      artist: firstHit.primary_artist.name,
      lyrics: `Lyrics available at: ${firstHit.url}\n\nNote: Could not automatically extract lyrics from Genius. Please visit the URL above for complete lyrics.`,
      url: firstHit.url,
      thumbnail: firstHit.song_art_image_url
    };

  } catch (error) {
    console.error('Error fetching from Genius API:', error);
    return null;
  }
}

/**
 * Fetches lyrics from the lyrics.ovh API as a fallback
 *
 * @param title - The title of the song
 * @param artist - The artist name
 * @returns The lyrics data or null if not found
 */
async function fetchLyricsFromOvh(title: string, artist: string): Promise<LyricsResponse | null> {
  try {
    // Encode the artist and title for the URL
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    
    // Construct the lyrics.ovh URL
    const url = `https://api.lyrics.ovh/v1/${encodedArtist}/${encodedTitle}`;
    console.log('Trying lyrics.ovh fallback:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`lyrics.ovh API failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('lyrics.ovh data:', data);

    // Validate the response with Zod
    const validatedData = LyricsOvhResponseSchema.parse(data);

    // Transform to match our expected format
    return {
      title,
      artist,
      lyrics: validatedData.lyrics,
      url: url
    };
  } catch (error) {
    console.error('Error fetching from lyrics.ovh:', error);
    return null;
  }
}

/**
 * Fetches lyrics for a song from the lyrics API with caching
 *
 * @param title - The title of the song
 * @param artist - Optional artist name to improve search accuracy
 * @param kv - Optional Cloudflare KV namespace for caching
 * @returns The lyrics data or an error message
 */
export async function fetchLyrics(title: string, artist?: string, kv?: KVNamespace): Promise<LyricsResponse> {
  try {
    // If we have both title, artist, and KV, try cache first
    if (artist && kv) {
      const cachedResult = await getCachedLyrics(kv, title, artist);
      if (cachedResult) {
        console.log('Returning cached lyrics', cachedResult);
        return cachedResult;
      }
    }

    // Encode the title for the URL
    const encodedTitle = encodeURIComponent(title);
    console.log('title ', encodedTitle);

    // Construct the URL for primary API
    let url = `https://api.some-random-api.com/lyrics?title=${encodedTitle}`;
    if (artist) {
      url += `&artist=${encodeURIComponent(artist)}`;
    }

    // Try primary API first
    const response = await fetch(url);

    // Check if the request was successful
    if (response.ok) {
      // Parse the response
      const data = await response.json();
      console.log('Primary API data:', data);

      // Validate the response with Zod
      const validatedData = LyricsResponseSchema.parse(data);
      
      // Cache successful result
      if (artist && kv && validatedData.lyrics && !validatedData.error) {
        await cacheLyrics(kv, title, artist, validatedData);
      }
      
      return validatedData;
    }

    // Primary API failed, try fallbacks if we have an artist
    if (artist) {
      console.log('Primary API failed, trying lyrics.ovh fallback...');
      const ovhResult = await fetchLyricsFromOvh(title, artist);
      
      if (ovhResult && ovhResult.lyrics.trim()) {
        // Cache successful result
        if (kv) {
          await cacheLyrics(kv, title, artist, ovhResult);
        }
        return ovhResult;
      }

      console.log('lyrics.ovh failed, trying Genius API fallback...');
      const geniusResult = await fetchLyricsFromGenius(title, artist);
      
      if (geniusResult && geniusResult.lyrics && !geniusResult.error) {
        // Cache successful result
        if (kv) {
          await cacheLyrics(kv, title, artist, geniusResult);
        }
        return geniusResult;
      }
    }

    // All APIs failed or no artist provided for fallbacks
    if (response.status === 404) {
      return {
        title,
        artist: artist || 'Unknown',
        lyrics: '',
        error: 'Lyrics not found for this song.'
      };
    }

    throw new Error(`API request failed with status ${response.status}`);

  } catch (error) {
    console.error('Error fetching lyrics:', error);

    // Return a structured error response
    return {
      title,
      artist: artist || 'Unknown',
      lyrics: '',
      error: error instanceof Error ? error.message : 'Failed to fetch lyrics'
    };
  }
}

/**
 * Searches for song lyrics by title and optionally artist
 *
 * @param query - The search query (song title and optionally artist)
 * @param kv - Optional Cloudflare KV namespace for caching
 * @returns The lyrics data or an error message
 */
export async function searchLyrics(query: string, kv?: KVNamespace): Promise<LyricsResponse> {
  // Use the query directly as the title
  // The API will handle the search
  return fetchLyrics(query, undefined, kv);
}
