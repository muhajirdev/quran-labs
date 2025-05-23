/**
 * Lyrics API utilities
 *
 * This module provides functions for fetching song lyrics from external APIs.
 */

import { z } from 'zod';
import { parse } from 'node-html-parser';

// Genius API access token
const GENIUS_ACCESS_TOKEN = "shU6DraV3Yl9AwdLhG36vCwUoYTbsSV0V3qWyy3keapRqWJ87CsPeZY2XcUeZGEf";

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
    
    // Try to find lyrics containers using various selectors
    const lyricsSelectors = [
      // Primary: Current Genius lyrics container
      'div[class*="Lyrics__Container"]',
      // Alternatives
      '[data-lyrics-container="true"]',
      '.lyrics',
      '.Lyrics__Container',
      'div[class*="lyrics"]',
      'div[class*="Lyrics"]'
    ];

    let allLyrics = '';

    for (const selector of lyricsSelectors) {
      const lyricsContainers = root.querySelectorAll(selector);
      
      if (lyricsContainers.length > 0) {
        console.log(`Found ${lyricsContainers.length} lyrics containers using selector: ${selector}`);
        
        for (const container of lyricsContainers) {
          // Get the text content, preserving line breaks
          let content = container.innerHTML;
          
          // Replace <br> tags with newlines before getting text
          content = content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/div>/gi, '\n');
          
          // Parse the modified content and get text
          const tempRoot = parse(content);
          const textContent = tempRoot.text
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .trim();
          
          if (textContent.length > 10) {
            allLyrics += textContent + '\n\n';
          }
        }
        
        // If we found lyrics, break out of the selector loop
        if (allLyrics.trim().length > 20) {
          break;
        }
      }
    }

    if (allLyrics.trim().length > 20) {
      console.log('Successfully scraped lyrics from Genius', allLyrics);
      return allLyrics.trim();
    }

    // Fallback: Look for JSON-LD structured data
    const scriptTags = root.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scriptTags) {
      try {
        const jsonContent = script.innerHTML;
        const data = JSON.parse(jsonContent);
        
        if (data.lyrics || (data['@type'] === 'MusicComposition' && data.text)) {
          const lyricsText = data.lyrics || data.text;
          console.log('Successfully scraped lyrics from Genius (JSON-LD)');
          return lyricsText;
        }
      } catch (e) {
        // Continue to next script tag
        continue;
      }
    }

    console.log('Could not extract lyrics from Genius page');
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
 * Fetches lyrics for a song from the lyrics API
 *
 * @param title - The title of the song
 * @param artist - Optional artist name to improve search accuracy
 * @returns The lyrics data or an error message
 */
export async function fetchLyrics(title: string, artist?: string): Promise<LyricsResponse> {
  try {
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
    console.log('Primary API response:', response);

    // Check if the request was successful
    if (response.ok) {
      // Parse the response
      const data = await response.json();
      console.log('Primary API data:', data);

      // Validate the response with Zod
      const validatedData = LyricsResponseSchema.parse(data);
      return validatedData;
    }

    // Primary API failed, try fallbacks if we have an artist
    if (artist) {
      console.log('Primary API failed, trying lyrics.ovh fallback...');
      const ovhResult = await fetchLyricsFromOvh(title, artist);
      
      if (ovhResult && ovhResult.lyrics.trim()) {
        return ovhResult;
      }

      console.log('lyrics.ovh failed, trying Genius API fallback...');
      const geniusResult = await fetchLyricsFromGenius(title, artist);
      
      if (geniusResult) {
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
 * @returns The lyrics data or an error message
 */
export async function searchLyrics(query: string): Promise<LyricsResponse> {
  // Use the query directly as the title
  // The API will handle the search
  return fetchLyrics(query);
}
