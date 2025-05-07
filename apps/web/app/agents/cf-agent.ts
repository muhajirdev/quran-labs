import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateObject,
  streamText,
  type Message,
  type StreamTextOnFinishCallback,
  type ToolSet,
  type StepResult,
} from "ai";
import { z } from "zod";
import { DEFAULT_SYSTEM_PROMPT } from "~/lib/system-prompt";
import {
  createSongWisdomAgent,
  type Message as SongWisdomMessage,
} from "./song-wisdom-agent";

// Define request types for routing
const RequestTypeSchema = z.enum(["song_wisdom", "general"]);

// Enhanced state for meta agent functionality
type State = {
  counter: number;
  messages: string[];
  lastUpdated: Date | null;
  lastRequestType?: z.infer<typeof RequestTypeSchema>;
  songWisdomState?: Record<string, any>;
};

/**
 * ChatAgent - Meta Agent Implementation
 *
 * This agent orchestrates different specialized agents based on the user's request.
 * It detects the type of request and routes it to the appropriate specialized agent.
 */
export class ChatAgent extends AIChatAgent<Env, State> {
  // Create specialized agents
  private songWisdomAgent = createSongWisdomAgent(this.env.OPENROUTER_API_KEY);

  /**
   * Detects the type of request using a lightweight model
   *
   * @param messages The conversation messages
   * @returns The detected request type
   */
  private async detectRequestType(
    messages: Message[]
  ): Promise<z.infer<typeof RequestTypeSchema>> {
    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    // Get the last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");
    if (!lastUserMessage) return "general";

    // Create a prompt for the routing model
    const routingPrompt = `
You are a request classifier for a Quran AI system. Your job is to determine which specialized agent should handle a user request.

User request: "${lastUserMessage.content}"

Classify this request into ONE of the following categories:
1. song_wisdom - If the user is asking about song lyrics, music meaning, or wants to connect song lyrics to Quranic wisdom
2. general - For all other Quran-related questions

Respond with ONLY the category name, nothing else.
`;

    try {
      const { object } = await generateObject({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        schema: z.object({
          type: RequestTypeSchema,
        }),
        prompt: routingPrompt,
        temperature: 0.5,
      });

      // Store the request type in state
      this.state.lastRequestType = object.type;

      return object.type;
    } catch (error) {
      console.error("Error in request classification:", error);
      return "general"; // Default to general on error
    }
  }

  // Override the onChatMessage method to implement meta agent routing
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    // Get the current conversation history
    const chatHistory = this.messages;

    try {
      // Detect the request type
      const requestType = await this.detectRequestType(chatHistory);
      console.log(`Request type detected: ${requestType}`);

      // Handle the request based on its type
      if (requestType === "song_wisdom") {
        console.log("Routing to SongWisdomAgent");

        // Process with SongWisdomAgent
        const songWisdomResponse = await this.songWisdomAgent.processRequest({
          messages: chatHistory,
          apiKey: this.env.OPENROUTER_API_KEY,
          temperature: 0.7,
          max_tokens: 1500,
        });

        // Call onFinish with the response
        onFinish({
          content: songWisdomResponse.choices[0].message.content,
        });

        // Create a response that mimics a stream
        return new Response(songWisdomResponse.choices[0].message.content, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
      }

      // For general queries, use the default behavior
      console.log("Routing to general assistant");

      // Generate a system prompt
      const systemPrompt = await this.generateSystemPrompt();

      // Use streamText for general queries
      const stream = streamText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        temperature: 0.7,
        maxTokens: 500,
        onFinish,
      });

      return stream.toDataStreamResponse();
    } catch (error) {
      console.error("Error in meta agent routing:", error);

      // Fallback to general assistant on error
      const systemPrompt = await this.generateSystemPrompt();

      const stream = streamText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        temperature: 0.7,
        maxTokens: 500,
        onFinish,
      });

      return stream.toDataStreamResponse();
    }
  }

  // Helper method to generate a system prompt
  async generateSystemPrompt() {
    // Use the default system prompt or customize based on context
    return (
      DEFAULT_SYSTEM_PROMPT ||
      `You are a helpful Quran AI assistant.
            Respond to inquiries based on the following guidelines:
            - Be friendly and professional
            - If you don't know an answer, say so
            - Provide wisdom from Islamic tradition when appropriate`
    );
  }
}
