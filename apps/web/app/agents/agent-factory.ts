/**
 * Agent Factory - A factory for creating agent configurations
 *
 * This module provides a factory pattern for creating agent configurations
 * that can be used by the MetaAgent to dynamically load the appropriate
 * system prompt and tools based on the agent type.
 */

import type { AgentDefinition } from "./agent-types";
import { AGENT_REGISTRY, getAgentById } from "./agent-registry";

/**
 * Agent Tool Configuration
 */
export interface AgentToolConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

/**
 * Agent Configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  tools: AgentToolConfig[];
}

/**
 * Get the tool configuration for a specific agent type
 *
 * @param agentId The ID of the agent
 * @returns Array of tool configurations for the agent
 */
export function getAgentToolConfig(agentId: string): AgentToolConfig[] {
  // Base tools available to all agents
  const baseTools: AgentToolConfig[] = [
    {
      id: "verseReference",
      name: "Verse Reference",
      description:
        "Reference a specific verse from the Quran by its chapter and verse number",
      enabled: true,
    },
  ];

  // Add specialized tools based on agent type
  switch (agentId) {
    case "song-wisdom":
      return [
        ...baseTools,
        {
          id: "fetchLyrics",
          name: "Fetch Lyrics",
          description: "Fetch lyrics for a song by title and optionally artist",
          enabled: true,
        },
      ];
    default:
      return baseTools;
  }
}

/**
 * Get the configuration for a specific agent type
 *
 * @param agentId The ID of the agent
 * @returns Agent configuration
 */
export function getAgentConfig(agentId: string): AgentConfig {
  const agentDef = getAgentById(agentId);

  if (!agentDef) {
    // Default configuration if agent not found
    return {
      id: "general",
      name: "General Assistant",
      description: "A general-purpose Quran AI assistant",
      systemPrompt:
        "You are a compassionate and understanding Quran AI assistant who speaks in the user's language and genuinely cares about their emotional journey.",
      tools: getAgentToolConfig("general"),
    };
  }

  return {
    id: agentDef.id,
    name: agentDef.name,
    description: agentDef.description,
    systemPrompt: agentDef.systemPrompt,
    tools: getAgentToolConfig(agentDef.id),
  };
}

/**
 * Create a new agent configuration
 *
 * @param id The ID of the agent
 * @param name The name of the agent
 * @param description The description of the agent
 * @param systemPrompt The system prompt for the agent
 * @param tools The tools available to the agent
 * @returns Agent configuration
 */
export function createAgentConfig(
  id: string,
  name: string,
  description: string,
  systemPrompt: string,
  tools: AgentToolConfig[] = []
): AgentConfig {
  return {
    id,
    name,
    description,
    systemPrompt,
    tools: tools.length > 0 ? tools : getAgentToolConfig(id),
  };
}

/**
 * Register a new agent in the registry
 *
 * @param agentDef The agent definition to register
 */
export function registerAgent(agentDef: AgentDefinition): void {
  // This would normally update the AGENT_REGISTRY
  // For now, we'll just log that a new agent was registered
  console.log(`Registered new agent: ${agentDef.id}`);
}
