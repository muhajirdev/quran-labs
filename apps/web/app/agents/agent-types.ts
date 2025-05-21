/**
 * Agent Types - Type definitions for the agent marketplace
 */

/**
 * AgentCapability - Represents a specific capability of an agent
 */
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

/**
 * AgentDefinition - Defines a specialized agent in the marketplace
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: string;
  iconColor?: string;
  backgroundColor?: string;
  capabilities: AgentCapability[];
  systemPrompt: string;
  exampleQueries: string[];
  isAvailable: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  category: AgentCategory;
}

/**
 * AgentCategory - Categories for organizing agents
 */
export type AgentCategory =
  | "knowledge"
  | "personal"
  | "educational"
  | "creative"
  | "meta";

/**
 * CategoryDefinition - Defines a category of agents
 */
export interface CategoryDefinition {
  id: AgentCategory;
  name: string;
  description: string;
  icon: string;
}
