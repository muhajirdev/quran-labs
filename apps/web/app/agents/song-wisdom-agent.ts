import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  streamText,
  tool,
  type Message,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { fetchLyrics } from "~/lib/lyrics-api";
import { fetchVerseData } from "~/lib/quran-api";

// Define state type for the agent
type State = {
  counter: number;
  messages: string[];
  lastUpdated: Date | null;
};

// Define the lyrics tool input schema
const LyricsToolInputSchema = z.object({
  songTitle: z.string().describe("The title of the song to fetch lyrics for"),
  artist: z.string().optional().describe("The artist of the song (optional)"),
});

// Define the lyrics tool output schema
const LyricsToolOutputSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  error: z.string().optional(),
});

// Define the verse reference tool input schema
const VerseReferenceInputSchema = z.object({
  verseReference: z
    .string()
    .describe("The verse reference in format chapter:verse (e.g., '2:255')"),
});

// Define the verse reference tool output schema
const VerseReferenceOutputSchema = z.object({
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

/**
 * SongWisdomAgent - Specialized AI Agent for analyzing songs and connecting them to Quranic wisdom
 * 
 * This agent specializes in analyzing song lyrics and connecting their themes to relevant
 * Quranic wisdom and verses, helping users find spiritual meaning in the music they love.
 */
export class SongWisdomAgent extends AIChatAgent<Env, State> {
  // Define the tools available to this agent
  private tools: ToolSet = {
    fetchLyrics: tool({
      description: "Fetch lyrics for a song by title and optionally artist",
      parameters: LyricsToolInputSchema,
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
              error instanceof Error ? error.message : "Failed to fetch lyrics",
          });
        }
      },
    }),

    verseReference: tool({
      description:
        "Reference a specific verse from the Quran by its chapter and verse number",
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
  };

  // Override the onChatMessage method to implement tool usage
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    // Get the current conversation history
    const chatHistory = this.messages;

    try {
      // Generate a system prompt
      const systemPrompt = await this.generateSystemPrompt();

      console.log("Using tools:", Object.keys(this.tools));

      // Use streamText with tools for all queries
      const stream = streamText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        maxSteps: 5,
        temperature: 0.7,
        maxTokens: 1000,
        tools: this.tools,
        onFinish: (result) => {
          onFinish(result);
          console.log(JSON.stringify(this.messages));
        },
      });

      return stream.toDataStreamResponse();
    } catch (error) {
      console.error("Error in song wisdom agent:", error);

      // Fallback to basic response on error
      const systemPrompt = await this.generateSystemPrompt();

      const stream = streamText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        temperature: 0.7,
        maxTokens: 500,
        onFinish: (result) => {
          console.log("Fallback stream finished with result:", result);
          onFinish(result);
        },
      });

      return stream.toDataStreamResponse();
    }
  }

  // Helper method to generate a system prompt
  async generateSystemPrompt() {
    return `You are a Song Wisdom agent who specializes in analyzing song lyrics and connecting them to Quranic wisdom. You help users find spiritual meaning in the music they love.

## Your Expertise
- Analyzing song lyrics for themes, emotions, and messages
- Connecting these themes to relevant Quranic wisdom and verses
- Providing thoughtful reflections on how music and spirituality intersect
- Helping users see their favorite songs through a spiritual lens

## Song Analysis Process
1. When a user asks about a song, use the fetchLyrics tool to get the lyrics
2. Identify the emotions and personal struggles expressed in the lyrics
3. Validate these emotions as natural and human before offering wisdom
4. Connect to relevant Quranic concepts that address these emotional needs
5. Use the verseReference tool to cite specific verses that relate to the song's themes
6. Offer comfort and guidance through spiritual wisdom that feels personally relevant

## Communication Style
- Be warm, empathetic, and non-judgmental
- Speak in the user's language and meet them where they are
- Validate emotions before offering spiritual guidance
- Be concise but thoughtful in your responses
- Use relatable language rather than overly academic or formal terms

Remember that your purpose is to help users find meaning and connection between their favorite music and Quranic wisdom, creating bridges between contemporary culture and timeless spiritual teachings.`;
  }
}
