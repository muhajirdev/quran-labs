import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import { type AgentContext as AgentContextType } from "agents";
import {
  streamText,
  tool,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { z } from "zod";
import { getAgentConfig } from "./agent-factory";
import { fetchLyrics } from "~/lib/lyrics-api";
import { fetchVerseData } from "~/lib/quran-api";

// Enhanced state for meta agent functionality
export type AgentState = {
  counter: number;
  messages: string[];
  lastUpdated: Date | null;
  agentType: string; // Store the agent type in the state
};

type State = AgentState;

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
 * MetaAgent - A single agent that can behave as different specialized agents
 *
 * This agent serves as a factory for creating specialized agent behaviors based
 * on the agent type specified in the connection name. It dynamically loads the
 * appropriate system prompt and tools based on the agent type.
 */
export class MetaAgent extends AIChatAgent<Env, State> {
  // Initialize the agent
  constructor(ctx: AgentContextType, env: Env) {
    super(ctx, env);
    // Initialize agentType in state
    this.setState({
      ...this.state,
      agentType: "general",
    });
  }

  // Define the tools available to this agent
  private getTools(): ToolSet {
    // Use the current agent type (which should be updated in onChatMessage)
    console.log(`Getting tools for agent type: ${this.state.agentType}`);

    // Get the agent configuration from the factory
    const agentConfig = getAgentConfig(this.state.agentType);

    // Base tools available to all agent types
    const tools: ToolSet = {
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

    // Add lyrics tool only for agents that have it enabled in their configuration
    if (
      agentConfig.tools.some(
        (tool) => tool.id === "fetchLyrics" && tool.enabled
      )
    ) {
      tools.fetchLyrics = tool({
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
                error instanceof Error
                  ? error.message
                  : "Failed to fetch lyrics",
            });
          }
        },
      });
    }

    return tools;
  }

  // Override the onChatMessage method to implement tool usage
  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    // Get the current conversation history
    const chatHistory = this.messages;

    try {
      // Check if the latest message contains an agent type indicator
      let agentType = this.state.agentType;

      // Check the latest user message for an agent type indicator
      if (chatHistory.length > 0) {
        const latestMessage = chatHistory[chatHistory.length - 1];

        if (
          latestMessage.role === "user" &&
          typeof latestMessage.content === "string"
        ) {
          // Look for [AGENT:agent_id] pattern at the beginning of the message
          const agentPattern = /^\[AGENT:([a-z0-9-_]+)\]\s*(.*)/i;
          const match = latestMessage.content.match(agentPattern);

          if (match) {
            const [fullMatch, extractedAgentType, actualContent] = match;

            console.log(`Found agent type in message: ${extractedAgentType}`);
            agentType = extractedAgentType;

            // Update the state
            this.setState({
              ...this.state,
              agentType: extractedAgentType,
            });

            // Remove the agent type indicator from the message
            latestMessage.content = actualContent.trim();

            console.log(`Updated agent type to: ${this.state.agentType}`);
            console.log(`Updated message content: ${latestMessage.content}`);
          }
        }
      }

      // If we're in a browser environment, try to get the agent type from the URL as a fallback
      if (typeof window !== "undefined") {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const urlAgent = urlParams.get("agent");

          if (urlAgent && agentType === "general") {
            console.log(
              `Found agent type in URL: ${urlAgent}, overriding current type: ${this.state.agentType}`
            );
            agentType = urlAgent;

            // Update the state
            this.setState({
              ...this.state,
              agentType: urlAgent,
            });

            console.log(`Updated agent type to: ${this.state.agentType}`);
          }
        } catch (error) {
          console.error("Error getting agent type from URL:", error);
        }
      }

      // Generate a system prompt based on the updated agent type
      const systemPrompt = await this.generateSystemPrompt();

      // Get the tools for this agent type
      const tools = this.getTools();

      console.log(`Using agent type: ${agentType}`);
      console.log("Using tools:", Object.keys(tools));

      // Log the first message to help debug
      console.log("Chat history length:", this.messages.length);
      if (this.messages.length === 0) {
        console.log("This is the first message in the conversation");
        console.log("System prompt:", systemPrompt);
      }

      // Use streamText with tools for all queries
      const stream = streamText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        maxSteps: 5,
        temperature: 0.7,
        maxTokens: 1000,
        tools: tools,
        onFinish: (result) => {
          onFinish(result);
          console.log(JSON.stringify(this.messages));
        },
      });

      return stream.toDataStreamResponse();
    } catch (error) {
      console.error(`Error in ${this.state.agentType} agent:`, error);

      // Check if the latest message contains an agent type indicator
      if (chatHistory.length > 0) {
        const latestMessage = chatHistory[chatHistory.length - 1];

        if (
          latestMessage.role === "user" &&
          typeof latestMessage.content === "string"
        ) {
          // Look for [AGENT:agent_id] pattern at the beginning of the message
          const agentPattern = /^\[AGENT:([a-z0-9-_]+)\]\s*(.*)/i;
          const match = latestMessage.content.match(agentPattern);

          if (match) {
            const [fullMatch, extractedAgentType, actualContent] = match;

            console.log(
              `Found agent type in message (fallback): ${extractedAgentType}`
            );

            // Update the state
            this.setState({
              ...this.state,
              agentType: extractedAgentType,
            });

            // Remove the agent type indicator from the message
            latestMessage.content = actualContent.trim();

            console.log(
              `Updated agent type to (fallback): ${this.state.agentType}`
            );
            console.log(
              `Updated message content (fallback): ${latestMessage.content}`
            );
          }
        }
      }

      // Update agent type from URL again in case it wasn't done earlier
      if (typeof window !== "undefined") {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const urlAgent = urlParams.get("agent");

          if (urlAgent && this.state.agentType === "general") {
            console.log(
              `Found agent type in URL (fallback): ${urlAgent}, overriding current type: ${this.state.agentType}`
            );
            this.setState({
              ...this.state,
              agentType: urlAgent,
            });

            console.log(
              `Updated agent type to (fallback): ${this.state.agentType}`
            );
          }
        } catch (fallbackError) {
          console.error(
            "Error getting agent type from URL in fallback:",
            fallbackError
          );
        }
      }

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

  // Helper method to generate a system prompt based on agent type
  async generateSystemPrompt() {
    // Use the current agent type (which should be updated in onChatMessage)
    console.log(
      `Generating system prompt for agent type: ${this.state.agentType}`
    );

    // Get the agent configuration from the factory
    const agentConfig = getAgentConfig(this.state.agentType);

    console.log(
      `Retrieved agent config for ${agentConfig.name} (${agentConfig.id})`
    );
    console.log(
      `System prompt (first 100 chars): ${agentConfig.systemPrompt.substring(
        0,
        100
      )}...`
    );

    // Return the system prompt from the configuration
    return agentConfig.systemPrompt;
  }
}
