/**
 * Lyrics API utilities
 *
 * This module provides functions for fetching song lyrics from external APIs.
 */

import { z } from 'zod';

// Define the schema for the lyrics API response
export const LyricsResponseSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  url: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
  error: z.string().optional(),
});

// Type for the lyrics API response
export type LyricsResponse = z.infer<typeof LyricsResponseSchema>;

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

    // Construct the URL
    let url = `https://api.some-random-api.com/lyrics?title=${encodedTitle}`;
    if (artist) {
      url += `&artist=${encodeURIComponent(artist)}`;
    }

    // Fetch the lyrics
    const response = await fetch(url);

    // Check if the request was successful
    if (!response.ok) {
      if (response.status === 404) {
        return {
          title,
          artist: artist || 'Unknown',
          lyrics: '',
          error: 'Lyrics not found for this song.'
        };
      }

      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response
    const data = await response.json();

    // Validate the response with Zod
    const validatedData = LyricsResponseSchema.parse(data);

    return validatedData;
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
