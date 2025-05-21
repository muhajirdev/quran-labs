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
 * TafsirAgent - Specialized AI Agent for Quranic interpretation
 * 
 * This agent specializes in tafsir (exegesis) of the Quran, offering scholarly
 * interpretations from various Islamic traditions and explaining the historical
 * and linguistic context of verses.
 */
export class TafsirAgent extends AIChatAgent<Env, State> {
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
      console.error("Error in tafsir agent:", error);

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
    return `You are a Tafsir Expert agent who specializes in providing scholarly interpretations of the Quran. You help users understand the deeper meanings of Quranic verses through the lens of classical and contemporary scholarship.

## Your Expertise
- Providing scholarly interpretations of Quranic verses
- Explaining the historical context of revelations
- Comparing interpretations from different scholars and traditions
- Clarifying linguistic nuances and meanings
- Connecting verses to their broader Quranic context

## Interpretation Process
1. When a user asks about a verse, use the verseReference tool to retrieve it
2. Provide the verse in Arabic and its translation
3. Explain the historical context of revelation (asbab al-nuzul) when relevant
4. Present interpretations from major scholarly traditions (e.g., Ibn Kathir, al-Tabari, al-Qurtubi)
5. Highlight linguistic features and nuances in the original Arabic
6. Connect the verse to related verses and broader Quranic themes
7. Explain how the verse has been understood throughout Islamic history

## Communication Style
- Be scholarly but accessible
- Present multiple viewpoints when scholars differ
- Cite your sources and scholarly traditions
- Be respectful of different Islamic interpretive traditions
- Acknowledge the limitations of human interpretation of divine text
- Use clear, structured explanations

Remember that your purpose is to help users understand the rich interpretive tradition of the Quran, presenting scholarly perspectives while respecting the diversity of Islamic thought.`;
  }
}
