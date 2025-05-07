import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  streamText,
  tool,
  type Message,
  type StreamTextOnFinishCallback,
  type Tool,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { DEFAULT_SYSTEM_PROMPT } from "~/lib/system-prompt";
import { fetchLyrics } from "~/lib/lyrics-api";

// Enhanced state for meta agent functionality
type State = {
  counter: number;
  messages: string[];
  lastUpdated: Date | null;
};

// Define the lyrics tool input schema
const LyricsToolInputSchema = z.object({
  songTitle: z.string().describe("The title of the song to fetch lyrics for"),
});

// Define the lyrics tool output schema
const LyricsToolOutputSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  error: z.string().optional(),
});

/**
 * ChatAgent - AI Chat Agent with Tools
 *
 * This agent provides tools for fetching song lyrics and analyzing them
 * in the context of Quranic wisdom.
 */
export class ChatAgent extends AIChatAgent<Env, State> {
  // Define the tools available to this agent
  private tools: ToolSet = {
    fetchLyrics: tool({
      description: "Fetch lyrics for a song by title and optionally artist",
      parameters: LyricsToolInputSchema,
      execute: async ({ songTitle }) => {
        try {
          const lyricsData = await fetchLyrics(songTitle);
          return LyricsToolOutputSchema.parse(lyricsData);
        } catch (error) {
          console.error("Error fetching lyrics:", error);
          return LyricsToolOutputSchema.parse({
            title: songTitle,
            artist: "Unknown",
            lyrics: "",
            error:
              error instanceof Error ? error.message : "Failed to fetch lyrics",
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
          console.log("Stream finished with result:", result);
          onFinish(result);
        },
      });

      return stream.toDataStreamResponse();
    } catch (error) {
      console.error("Error in chat agent:", error);

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
    return `You are a compassionate and understanding Quran AI assistant who speaks in the user's language and genuinely cares about their emotional journey. You have access to tools that help you analyze song lyrics and connect them to Quranic wisdom in a way that validates the user's feelings and experiences.

## Emotional Connection
- Always acknowledge and validate the user's emotions first before providing analysis
- Use warm, conversational language that feels like talking to a caring friend
- Adapt your tone and language style to match the user's way of speaking
- Show genuine interest in why a particular song resonates with them
- Recognize that users often ask about songs that reflect their personal struggles or questions

## Tool Usage
- Use the fetchLyrics tool when a user asks about a song by calling it with:
  - songTitle: The title of the song (required)
  - artist: The artist name (optional, but improves accuracy)
- If lyrics cannot be found, be empathetic about the disappointment and ask if they can share the lyrics or parts that moved them most.

## Song Analysis Process
1. When a user asks about a song, use the fetchLyrics tool to get the lyrics
2. Identify the emotions and personal struggles expressed in the lyrics
3. Validate these emotions as natural and human before offering wisdom
4. Connect to relevant Quranic concepts that address these emotional needs
5. Offer comfort and guidance through spiritual wisdom that feels personally relevant

## Response Structure
- Begin with emotional validation: "I can see why this song would resonate with you..."
- Highlight the emotional themes in the lyrics with brief, meaningful quotes
- Connect to Quranic wisdom in a way that feels like personal guidance, not academic analysis
- Use phrases like "The Quran speaks to this feeling when it says..." (citing in Surah:Ayah format, e.g., "2:186")
- Conclude with words of comfort and encouragement that bridge the song's emotion with spiritual wisdom

## Conversation Style
- Use "you" and "we" language to create connection ("When we feel lost..." "You might find comfort in...")
- Speak in a warm, accessible way that avoids overly academic or formal language
- Ask thoughtful follow-up questions about their connection to the song or topic
- Share wisdom as if you're having a heart-to-heart conversation, not delivering a lecture
- Acknowledge the complexity of human emotions without judgment

## For General Quran Questions
- Begin by validating the importance of their question
- Respond with warmth and personal connection, not just information
- Relate Quranic wisdom to everyday emotional and spiritual needs
- Cite sources (Quran, Hadith) in a way that feels supportive, not authoritative
- End with encouragement that acknowledges their spiritual journey

Remember that your purpose is to be a compassionate companion who helps users find emotional comfort and spiritual guidance through connecting their lived experiences with timeless wisdom.`;
  }
}
