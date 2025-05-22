/**
 * Tools - Defines and implements all available tools that can be used by agents
 */

import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { fetchLyrics } from "~/lib/lyrics-api";
import { fetchVerseData } from "~/lib/quran-api";

/**
 * Tool Configuration
 */
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Schema definitions for tool inputs and outputs
export const VerseReferenceInputSchema = z.object({
  verseReference: z.string().describe("The verse reference in format chapter:verse"),
});

export const VerseReferenceOutputSchema = z.object({
  verse_key: z.string(),
  arabic_text: z.string(),
  chapter_name: z.string().optional(),
  translations: z
    .array(
      z.object({
        text: z.string(),
        translator: z.string().optional(),
      })
    )
    .optional(),
  error: z.string().optional(),
});

export const LyricsInputSchema = z.object({
  songTitle: z.string().describe("The title of the song"),
  artist: z.string().optional().describe("The artist name (optional)"),
});

export const LyricsToolOutputSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  error: z.string().optional(),
});

/**
 * Tool Registry - All available tools
 */
export const TOOL_REGISTRY: Record<string, ToolConfig> = {
  // Verse reference tool - available to all agents
  verseReference: {
    id: "verseReference",
    name: "Verse Reference",
    description:
      "Reference a specific verse from the Quran by its chapter and verse number",
    enabled: true,
  },
  
  // Fetch lyrics tool - used by the Song Wisdom agent
  fetchLyrics: {
    id: "fetchLyrics",
    name: "Fetch Lyrics",
    description: "Fetch lyrics for a song by title and optionally artist",
    enabled: true,
  },
};

/**
 * Get a tool by ID
 */
export function getToolById(id: string): ToolConfig | undefined {
  return TOOL_REGISTRY[id];
}

/**
 * Get multiple tools by their IDs
 */
export function getToolsByIds(ids: string[]): ToolConfig[] {
  return ids
    .map(id => TOOL_REGISTRY[id])
    .filter(tool => tool !== undefined) as ToolConfig[];
}

/**
 * Get all available tools
 */
export function getAllTools(): ToolConfig[] {
  return Object.values(TOOL_REGISTRY);
}

/**
 * Get tool implementations for a specific set of tool IDs
 * 
 * @param toolIds Array of tool IDs that the agent can use
 * @returns A set of tool implementations
 */
export function getToolImplementations(toolIds: string[]): ToolSet {
  const allTools = getAllToolImplementations();
  
  // Filter tools based on provided tool IDs
  const filteredTools: ToolSet = {};
  
  for (const id of toolIds) {
    if (id in allTools) {
      filteredTools[id] = allTools[id];
    }
  }
  
  return filteredTools;
}

/**
 * Get all tool implementations
 * 
 * @returns A set of all tool implementations
 */
export function getAllToolImplementations(): ToolSet {
  return {
    // Verse reference tool
    verseReference: tool({
      description: TOOL_REGISTRY.verseReference.description,
      parameters: VerseReferenceInputSchema,
      execute: async ({ verseReference }) => {
        try {
          // Fetch verse data directly using our utility function
          const verseData = await fetchVerseData(verseReference);

          if (verseData.error) {
            throw new Error(verseData.error);
          }

          return VerseReferenceOutputSchema.parse({
            verse_key: verseData.verse_key,
            arabic_text: verseData.arabic_text,
            chapter_name: verseData.chapter_name,
            translations: verseData.translations,
          });
        } catch (error) {
          console.error("Error fetching verse:", error);
          return VerseReferenceOutputSchema.parse({
            verse_key: verseReference,
            arabic_text: "",
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch verse data",
          });
        }
      },
    }),

    // Fetch lyrics tool
    fetchLyrics: tool({
      description: TOOL_REGISTRY.fetchLyrics.description,
      parameters: LyricsInputSchema,
      execute: async ({ songTitle, artist }) => {
        try {
          const lyricsData = await fetchLyrics(songTitle, artist);
          return LyricsToolOutputSchema.parse(lyricsData);
        } catch (error) {
          console.error("Error fetching lyrics:", error);
          return LyricsToolOutputSchema.parse({
            title: songTitle,
            artist: artist || "Unknown",
            lyrics: "",
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch lyrics",
          });
        }
      },
    }),
  };
}
