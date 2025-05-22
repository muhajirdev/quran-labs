import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import { type AgentContext as AgentContextType } from "agents";
import {
  streamText,
  type StreamTextOnFinishCallback,
  type ToolSet,
} from "ai";
import { getAgentById } from "./agent-registry";
import { getToolImplementations } from "./tools";

// Enhanced state for meta agent functionality
export type AgentState = {
  agentId: string; // Store the agent type in the state
};

type State = AgentState;

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
      agentId: "general",
    });
  }

  // Define the tools available to this agent
  private getTools(): ToolSet {
    // Use the current agent type (which should be updated in onChatMessage)
    console.log(`Getting tools for agent type: ${this.state.agentId}`);

    // Get the agent definition from the registry
    const agentDef = getAgentById(this.state.agentId);

    // Default tools if agent not found
    if (!agentDef) {
      return getToolImplementations(["verseReference"]);
    }

    // Get tool IDs from the agent definition
    const toolIds = agentDef.tools?.map(tool => tool.id) || ["verseReference"];

    // Get tool implementations for this agent
    return getToolImplementations(toolIds);
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
      let agentType = this.state.agentId;

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
              agentId: extractedAgentType,
            });

            // Remove the agent type indicator from the message
            latestMessage.content = actualContent.trim();

            console.log(`Updated agent type to: ${this.state.agentId}`);
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
              `Found agent type in URL: ${urlAgent}, overriding current type: ${this.state.agentId}`
            );
            agentType = urlAgent;

            // Update the state
            this.setState({
              ...this.state,
              agentId: urlAgent,
            });

            console.log(`Updated agent type to: ${this.state.agentId}`);
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
      console.error(`Error in ${this.state.agentId} agent:`, error);

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
              agentId: extractedAgentType,
            });

            // Remove the agent type indicator from the message
            latestMessage.content = actualContent.trim();

            console.log(
              `Updated agent type to (fallback): ${this.state.agentId}`
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

          if (urlAgent && this.state.agentId === "general") {
            console.log(
              `Found agent type in URL (fallback): ${urlAgent}, overriding current type: ${this.state.agentId}`
            );
            this.setState({
              ...this.state,
              agentId: urlAgent,
            });

            console.log(
              `Updated agent type to (fallback): ${this.state.agentId}`
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
      `Generating system prompt for agent type: ${this.state.agentId}`
    );

    // Get the agent definition from the registry
    const agentDef = getAgentById(this.state.agentId);

    // Default system prompt if agent not found
    if (!agentDef) {
      const defaultPrompt = "You are the General Assistant for Quran AI, a compassionate guide who helps users explore and understand Islamic teachings with wisdom and empathy.";
      console.log(`Using default system prompt for unknown agent type: ${this.state.agentId}`);
      return defaultPrompt;
    }

    console.log(
      `Retrieved agent definition for ${agentDef.name} (${agentDef.id})`
    );
    console.log(
      `System prompt (first 100 chars): ${agentDef.systemPrompt.substring(
        0,
        100
      )}...`
    );

    // Return the system prompt from the agent definition
    return agentDef.systemPrompt;
  }
}
