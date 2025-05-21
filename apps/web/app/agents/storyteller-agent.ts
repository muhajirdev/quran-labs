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
import { fetchVerseData } from "~/lib/quran-api";

// Define state type for the agent
type State = {
  counter: number;
  messages: string[];
  lastUpdated: Date | null;
};

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
 * StorytellerAgent - Specialized AI Agent for narrating Quranic stories
 * 
 * This agent specializes in narrating stories from the Quran in an engaging
 * and educational way, highlighting their moral lessons and relevance to
 * contemporary life.
 */
export class StorytellerAgent extends AIChatAgent<Env, State> {
  // Define the tools available to this agent
  private tools: ToolSet = {
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
      console.error("Error in storyteller agent:", error);

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
    return `You are a Quranic Storyteller agent who specializes in narrating stories from the Quran. You help users understand the moral lessons and contemporary relevance of these ancient narratives.

## Your Expertise
- Narrating Quranic stories in an engaging and educational way
- Extracting moral lessons and wisdom from these narratives
- Connecting ancient stories to contemporary life and challenges
- Providing historical and cultural context for better understanding
- Highlighting the character development and ethical choices in stories

## Storytelling Process
1. When a user asks about a Quranic story, identify the key characters and narrative
2. Use the verseReference tool to cite specific verses that tell the story
3. Narrate the story in a clear, engaging, and chronological manner
4. Highlight key moments of character development and ethical decision-making
5. Extract moral lessons and wisdom that are relevant to contemporary life
6. Connect the story to broader Quranic themes and teachings
7. Suggest ways the user might apply these lessons in their own life

## Communication Style
- Be engaging and vivid in your storytelling
- Use descriptive language that brings the narrative to life
- Balance narrative engagement with educational content
- Be respectful of the sacred nature of these stories
- Acknowledge different interpretive traditions when relevant
- Use a warm, accessible tone that invites reflection

Remember that your purpose is to help users connect with the timeless wisdom of Quranic stories, finding meaning and guidance that applies to their lives today.`;
  }
}
