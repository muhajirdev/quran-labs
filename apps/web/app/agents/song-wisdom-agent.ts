/**
 * SongWisdomAgent
 *
 * This agent analyzes song lyrics and extracts Quranic wisdom and connections.
 * It follows a two-step reasoning process:
 * 1. First, it extracts the deeper meaning and themes from the lyrics
 * 2. Then, it connects these themes to relevant Quranic concepts and verses
 *
 * The agent is autonomous and manages its own execution flow:
 * - It can extract song information from user messages
 * - It can fetch lyrics if needed
 * - It processes the lyrics to extract wisdom
 * - It formats its own response
 */

import { DEFAULT_SYSTEM_PROMPT } from "~/lib/system-prompt";
import { z } from "zod";
import { fetchLyrics } from "~/lib/lyrics-api";
import {
  generateObject,
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Types for messages
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Types for the agent request
export interface SongWisdomAgentRequest {
  messages: Message[];
  apiKey: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  onFinish?: StreamTextOnFinishCallback<ToolSet>;
}

// Types for the agent response
export interface SongWisdomAgentResponse {
  id: string;
  choices: {
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }[];
}

// Zod schema for the agent output
export const SongWisdomOutputSchema = z.object({
  songTitle: z.string(),
  artist: z.string(),
  themes: z.array(z.string()),
  meaningAnalysis: z.string(),
  quranicConnections: z.object({
    concepts: z.array(z.string()),
    verses: z
      .array(
        z.object({
          reference: z.string(),
          text: z.string(),
          connection: z.string(),
        })
      )
      .optional(),
  }),
  wisdom: z.string(),
});

// Type for internal song information
interface SongInfo {
  lyrics: string;
  songTitle?: string;
  artist?: string;
  language?: string;
}

// System prompt for the SongWisdomAgent
const SONG_WISDOM_SYSTEM_PROMPT = `${DEFAULT_SYSTEM_PROMPT}

You are now specialized in analyzing song lyrics and connecting them to Quranic wisdom. Follow this two-step process:

STEP 1: MEANING EXTRACTION
- Identify the key themes, emotions, and messages in the song lyrics
- Look for universal human experiences and philosophical questions
- Understand the context and deeper meaning beyond literal interpretation
- Recognize metaphors and symbolic language

STEP 2: QURANIC CONNECTION
- Connect the extracted themes to relevant Quranic concepts
- Identify specific verses that relate to these themes
- Explain how the Quran addresses similar questions or emotions
- Provide wisdom from Islamic tradition that relates to the song's themes

IMPORTANT GUIDELINES:
- Be respectful of both the artistic expression and religious tradition
- Avoid forcing connections where they don't naturally exist
- Acknowledge when themes may be in tension with Islamic teachings
- Focus on wisdom and spiritual insight rather than judgment
- Validate the human emotions expressed in the lyrics

FORMAT YOUR RESPONSE IN THESE SECTIONS:
1. Themes & Meaning: Analyze the key themes and deeper meaning of the lyrics
2. Quranic Connections: Connect these themes to relevant Quranic concepts and verses
3. Wisdom: Provide spiritual wisdom that bridges the song and Quranic teachings

Remember to be emotionally intelligent, validating the human experience while offering spiritual insight.`;

/**
 * Creates a SongWisdomAgent that analyzes song lyrics and extracts Quranic wisdom
 *
 * @param apiKey - OpenRouter API key (optional, will use environment variable if not provided)
 * @returns A SongWisdomAgent
 */
export function createSongWisdomAgent(apiKey?: string) {
  const openRouter = createOpenRouter({
    apiKey: apiKey,
  });
  /**
   * Extract song information from a message
   *
   * @param message The message to extract information from
   * @returns The extracted song information
   */
  const extractSongInfo = async (message: string): Promise<SongInfo> => {
    // Create a prompt for the extraction model
    const extractionPrompt = `
You are a song information extractor. Extract the following information from the user's message:
1. Song title (if mentioned)
2. Artist name (if mentioned)
3. Song lyrics (the actual text of the song)

If the user is asking about a song but doesn't provide lyrics, identify the song title and artist.
If the user provides lyrics, extract them accurately.

User message:
"""
${message}
"""

Respond with a JSON object containing the extracted information.
`;

    try {
      // Define the schema for song information extraction
      const SongInfoSchema = z.object({
        songTitle: z.string().nullable(),
        artist: z.string().nullable(),
        lyrics: z.string(),
      });

      // Extract song information using generateObject
      const { object } = await generateObject({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        schema: SongInfoSchema,
        prompt: extractionPrompt,
        temperature: 0.1,
        maxTokens: 500,
      });

      const songTitle =
        object.songTitle === null ? undefined : object.songTitle;
      const artist = object.artist === null ? undefined : object.artist;
      const lyrics = object.lyrics || "";

      return {
        lyrics,
        songTitle,
        artist,
        language: "en", // Default language
      };
    } catch (error) {
      console.error("Error in song information extraction:", error);
      return { lyrics: message }; // Default to using the whole message as lyrics
    }
  };

  /**
   * Fetch lyrics for a song if needed
   *
   * @param songInfo The song information
   * @returns Updated song information with lyrics
   */
  const fetchLyricsIfNeeded = async (songInfo: SongInfo): Promise<SongInfo> => {
    let { lyrics, songTitle, artist } = songInfo;

    // If lyrics are very short or not provided but we have a title, try to fetch them
    if (
      (!lyrics || lyrics.length < 20) &&
      songTitle &&
      songTitle !== "Unknown Song"
    ) {
      console.log(
        `Lyrics not provided or too short. Fetching lyrics for "${songTitle}" by "${
          artist || "Unknown Artist"
        }"`
      );

      try {
        // Try to fetch lyrics from the API
        const lyricsData = await fetchLyrics(songTitle, artist);

        // If lyrics were found, use them
        if (lyricsData.lyrics && !lyricsData.error) {
          console.log(
            `Successfully fetched lyrics for "${lyricsData.title}" by "${lyricsData.artist}"`
          );
          lyrics = lyricsData.lyrics;

          // Update title and artist if they were found
          if (
            (!songTitle || songTitle === "Unknown Song") &&
            lyricsData.title
          ) {
            songTitle = lyricsData.title;
          }

          if ((!artist || artist === "Unknown Artist") && lyricsData.artist) {
            artist = lyricsData.artist;
          }
        } else if (lyricsData.error) {
          console.log(`Error fetching lyrics: ${lyricsData.error}`);
        }
      } catch (error) {
        console.error("Failed to fetch lyrics:", error);
      }
    }

    // If we still don't have lyrics but have a title, try a more general search
    if ((!lyrics || lyrics.length < 20) && songTitle) {
      console.log(
        `Still no lyrics. Trying a more general search for "${songTitle}"`
      );

      try {
        // Try a more general search
        const lyricsData = await fetchLyrics(songTitle);

        // If lyrics were found, use them
        if (lyricsData.lyrics && !lyricsData.error) {
          console.log(
            `Successfully fetched lyrics for "${lyricsData.title}" by "${lyricsData.artist}"`
          );
          lyrics = lyricsData.lyrics;

          // Update title and artist if they were found
          if (
            (!songTitle || songTitle === "Unknown Song") &&
            lyricsData.title
          ) {
            songTitle = lyricsData.title;
          }

          if ((!artist || artist === "Unknown Artist") && lyricsData.artist) {
            artist = lyricsData.artist;
          }
        } else if (lyricsData.error) {
          console.log(`Error fetching lyrics: ${lyricsData.error}`);
        }
      } catch (error) {
        console.error("Failed to fetch lyrics with general search:", error);
      }
    }

    return {
      lyrics: lyrics || "",
      songTitle: songTitle || "Unknown Song",
      artist: artist || "Unknown Artist",
      language: songInfo.language || "en",
    };
  };

  /**
   * Analyze song lyrics and extract Quranic wisdom
   *
   * @param songInfo The song information
   * @returns The analysis result
   */
  /**
   * Format the analysis result into a readable response
   *
   * @param result The analysis result
   * @returns A formatted string response
   */
  const formatResponse = (
    result: z.infer<typeof SongWisdomOutputSchema>
  ): string => {
    let response = "";

    // Add song information
    response += `## ${result.songTitle || "Song Analysis"}\n`;
    if (result.artist) {
      response += `*by ${result.artist}*\n\n`;
    } else {
      response += "\n";
    }

    // Add meaning analysis
    response += `### Themes & Meaning\n${result.meaningAnalysis}\n\n`;

    // Add themes
    if (result.themes && result.themes.length > 0) {
      response += "**Key Themes:**\n";
      result.themes.forEach((theme: string) => {
        response += `- ${theme}\n`;
      });
      response += "\n";
    }

    // Add Quranic connections
    response += `### Quranic Connections\n`;

    // Add concepts
    if (
      result.quranicConnections.concepts &&
      result.quranicConnections.concepts.length > 0
    ) {
      response += "**Related Concepts:**\n";
      result.quranicConnections.concepts.forEach((concept: string) => {
        response += `- ${concept}\n`;
      });
      response += "\n";
    }

    // Add verses
    if (
      result.quranicConnections.verses &&
      result.quranicConnections.verses.length > 0
    ) {
      response += "**Relevant Verses:**\n\n";
      result.quranicConnections.verses.forEach((verse) => {
        response += `**${verse.reference}**\n`;
        response += `> ${verse.text}\n\n`;
        if (verse.connection) {
          response += `${verse.connection}\n\n`;
        }
      });
    }

    // Add wisdom
    response += `### Spiritual Wisdom\n${result.wisdom}\n`;

    return response;
  };

  /**
   * Process a request from the user
   *
   * @param request The request to process
   * @returns The response (streaming or non-streaming)
   */
  const processRequest = async (
    request: SongWisdomAgentRequest
  ): Promise<SongWisdomAgentResponse | Response> => {
    try {
      // Get the last user message
      const lastUserMessage = [...request.messages]
        .reverse()
        .find((msg) => msg.role === "user");
      if (!lastUserMessage) {
        throw new Error("No user message found");
      }

      // Extract song information from the message
      console.log("Extracting song information from message");
      const songInfo = await extractSongInfo(lastUserMessage.content);

      // Fetch lyrics if needed
      console.log("Fetching lyrics if needed");
      const songInfoWithLyrics = await fetchLyricsIfNeeded(songInfo);

      // If we still don't have lyrics, return an error
      if (!songInfoWithLyrics.lyrics || songInfoWithLyrics.lyrics.length < 20) {
        const errorMessage =
          "I couldn't find the lyrics for this song. Please provide the lyrics or try a different song.";

        // If streaming is requested, return a streaming response
        if (request.stream) {
          // We don't need to call onFinish as we're handling the response directly
          return new Response(errorMessage, {
            headers: {
              "Content-Type": "text/plain",
            },
          });
        }

        // Otherwise return a regular response
        return {
          id: `song-wisdom-error-${Date.now()}`,
          choices: [
            {
              message: {
                role: "assistant",
                content: errorMessage,
              },
              finish_reason: "stop",
            },
          ],
        };
      }

      // Analyze the song
      console.log("Analyzing song");
      const analysisResult = await analyzeSong(songInfoWithLyrics);

      // Format the response
      console.log("Formatting response");
      const formattedResponse = formatResponse(analysisResult);

      // If streaming is requested, return a streaming response
      if (request.stream) {
        // We don't need to call onFinish as we're handling the response directly

        // Return a streaming response
        return new Response(formattedResponse, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      // Otherwise return a regular response
      return {
        id: `song-wisdom-${Date.now()}`,
        choices: [
          {
            message: {
              role: "assistant",
              content: formattedResponse,
            },
            finish_reason: "stop",
          },
        ],
      };
    } catch (error: unknown) {
      console.error("Error in SongWisdomAgent:", error);
      const errorMessage = `I encountered an error while analyzing the song: ${
        error instanceof Error ? error.message : String(error)
      }`;

      // If streaming is requested, return a streaming response
      if (request.stream) {
        // We don't need to call onFinish as we're handling the response directly
        return new Response(errorMessage, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      // Otherwise return a regular response
      return {
        id: `song-wisdom-error-${Date.now()}`,
        choices: [
          {
            message: {
              role: "assistant",
              content: errorMessage,
            },
            finish_reason: "error",
          },
        ],
      };
    }
  };

  /**
   * Analyze song lyrics and extract Quranic wisdom
   *
   * @param songInfo The song information
   * @returns The analysis result
   */
  const analyzeSong = async (
    songInfo: SongInfo
  ): Promise<z.infer<typeof SongWisdomOutputSchema>> => {
    const { lyrics, songTitle, artist, language } = songInfo;

    // Prepare the system prompt with instructions for structured output
    const systemPrompt = `${SONG_WISDOM_SYSTEM_PROMPT}

You must respond with a valid JSON object that follows this structure:
{
  "songTitle": "Title of the song",
  "artist": "Name of the artist",
  "themes": ["Theme 1", "Theme 2", ...],
  "meaningAnalysis": "Detailed analysis of the song's meaning",
  "quranicConnections": {
    "concepts": ["Concept 1", "Concept 2", ...],
    "verses": [
      {
        "reference": "Chapter:Verse",
        "text": "The verse text",
        "connection": "How this verse connects to the song"
      },
      ...
    ]
  },
  "wisdom": "Spiritual wisdom derived from the song and Quranic connections"
}`;

    // Prepare the user prompt
    const userPrompt = `
Song Title: ${songTitle}
Artist: ${artist}
Language: ${language || "en"}

Lyrics:
${lyrics}

Please analyze these lyrics following the two-step process:
1. First, extract the deeper meaning and themes
2. Then, connect these themes to Quranic wisdom and relevant verses

Respond with a structured JSON object as specified.
`;

    try {
      // Use generateObject to get a structured response
      const { object } = await generateObject({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        schema: SongWisdomOutputSchema,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 1500,
      });

      return object;
    } catch (error: unknown) {
      console.error("Error in SongWisdomAgent analysis:", error);

      // Return a fallback response
      return {
        songTitle: songTitle || "Unknown Song",
        artist: artist || "Unknown Artist",
        themes: ["Error occurred during analysis"],
        meaningAnalysis:
          "Sorry, I encountered an error while analyzing these lyrics.",
        quranicConnections: {
          concepts: ["Error occurred during analysis"],
          verses: [
            {
              reference: "Error",
              text: "Could not analyze lyrics",
              connection: "An error occurred during the analysis process.",
            },
          ],
        },
        wisdom:
          "Please try again with different lyrics or check your connection.",
      };
    }
  };

  // Return the public API
  return {
    processRequest,
  };
}
