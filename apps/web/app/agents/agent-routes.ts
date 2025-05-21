/**
 * Agent Routes - Defines the mapping between agent IDs and agent classes
 *
 * This file serves as a registry for all available agent implementations.
 * When a user selects an agent from the marketplace, the corresponding
 * agent class is instantiated based on this mapping.
 */

import { ChatAgent } from "./cf-agent";
import { SongWisdomAgent } from "./song-wisdom-agent";
import { TafsirAgent } from "./tafsir-agent";
import { StorytellerAgent } from "./storyteller-agent";

/**
 * Agent Routes - Maps agent IDs to their corresponding agent classes
 */
export const AGENT_ROUTES = {
  // Default general-purpose agent
  general: ChatAgent,

  // Specialized agents
  "song-wisdom": SongWisdomAgent,
  tafsir: TafsirAgent,
  storyteller: StorytellerAgent,
};

/**
 * Get agent class by ID
 *
 * @param agentId The ID of the agent to retrieve
 * @returns The agent class or the default ChatAgent if not found
 */
export function getAgentClassById(agentId: string) {
  return AGENT_ROUTES[agentId as keyof typeof AGENT_ROUTES] || ChatAgent;
}
