import {
  createOpenRouter,
  type OpenRouterProvider,
} from "@openrouter/ai-sdk-provider";
import { AIChatAgent } from "agents/ai-chat-agent";
import { type AgentContext as AgentContextType } from "agents";
import { streamText, type StreamTextOnFinishCallback, type ToolSet } from "ai";
import { getAgentById } from "./agent-registry";
import { getToolImplementations } from "./tools";
import { TOOL_USAGE_INSTRUCTIONS } from "./shared-prompts";

/**
 * Agent state interface
 * @property agentId - The ID of the current agent type
 */
export type AgentState = {
  agentId: string;
};

type State = AgentState;

// Default agent ID if none is specified
const DEFAULT_AGENT_ID = "song-wisdom";
const DEFAULT_SYSTEM_PROMPT =
  "You are the Song Wisdom Agent for SuperQuran, a creative guide who connects popular music with Quranic wisdom, helping users discover spiritual insights within the songs they love.";

/**
 * MetaAgent - A single agent that can behave as different specialized agents
 */
export class MetaAgent extends AIChatAgent<Env, State> {
  constructor(ctx: AgentContextType, env: Env) {
    super(ctx, env);
    this.setState({
      agentId: this.state?.agentId || DEFAULT_AGENT_ID, // ? is important because sometime this.state is undefined
    });
  }

  private getTools(openRouter: OpenRouterProvider): ToolSet {
    const agentDef = getAgentById(this.state.agentId);
    const toolIds = agentDef?.tools?.map((tool) => tool.id) || [
      "verseReference",
    ];
    return getToolImplementations(toolIds, openRouter.languageModel("google/gemini-2.0-flash-001"));
  }

  private extractAgentInfo(message: {
    role: string;
    content: string;
  }): { agentId: string; content: string } | null {
    if (message.role !== "user" || typeof message.content !== "string") {
      return null;
    }

    const agentPattern = /^\[AGENT:([a-z0-9-_]+)\]\s*(.*)/i;
    const match = message.content.match(agentPattern);

    if (!match) return null;

    const [_, agentId, content] = match;
    return { agentId, content: content.trim() };
  }

  private updateAgentType(newAgentId: string): string {
    if (newAgentId !== this.state.agentId) {
      this.setState({
        agentId: newAgentId,
      });
    }
    return newAgentId;
  }

  private createStreamResponse = ({
    systemPrompt,
    messages,
    tools,
    onFinish,
  }: {
    systemPrompt: string;
    messages: any[];
    tools: ToolSet;
    onFinish?: (result: any) => void;
  }) => {
    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    return streamText({
      model: openRouter.languageModel("google/gemini-2.0-flash-001"),
      messages: [
        { role: "system" as const, content: systemPrompt },
        ...messages,
      ],
      maxSteps: 5,
      temperature: 0.7,
      maxTokens: 1000,
      tools,
      onFinish: (result) => {
        onFinish?.(result);
      },
    }).toDataStreamResponse();
  };

  async onChatMessage(onFinish: StreamTextOnFinishCallback<ToolSet>) {
    const chatHistory = this.messages;
    let agentType = this.state.agentId;

    if (chatHistory.length > 0) {
      const latestMessage = chatHistory[chatHistory.length - 1];
      const agentInfo = this.extractAgentInfo(latestMessage);

      if (agentInfo) {
        agentType = this.updateAgentType(agentInfo.agentId);
        latestMessage.content = agentInfo.content;
      }
    }

    const openRouter = createOpenRouter({
      apiKey: this.env.OPENROUTER_API_KEY,
    });

    const systemPrompt = await this.generateSystemPrompt();
    const tools = this.getTools(openRouter);

    return this.createStreamResponse({
      systemPrompt,
      messages: chatHistory,
      tools,
      onFinish,
    });
  }

  private async generateSystemPrompt(): Promise<string> {
    const agentDef = getAgentById(this.state.agentId);
    let systemPrompt = agentDef?.systemPrompt || DEFAULT_SYSTEM_PROMPT;

    // Ensure the system prompt includes tool usage instructions
    if (!systemPrompt.includes("TOOL USAGE INSTRUCTIONS")) {
      systemPrompt += "\n\n" + TOOL_USAGE_INSTRUCTIONS;
    }

    return systemPrompt;
  }
}
