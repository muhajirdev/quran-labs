/**
 * Agent Registry - Defines all available agents in the marketplace
 */

import type { AgentDefinition, CategoryDefinition } from "./agent-types";
import { getToolById } from "./tools";
import { generateSystemPrompt } from "./shared-prompts";

/**
 * Agent Categories
 */
export const AGENT_CATEGORIES: CategoryDefinition[] = [
  {
    id: "knowledge",
    name: "Knowledge & Interpretation",
    description:
      "Agents focused on understanding and explaining Quranic knowledge",
    icon: "BookOpen",
  },
  {
    id: "personal",
    name: "Personal Guidance",
    description:
      "Agents focused on applying Quranic wisdom to personal situations",
    icon: "Heart",
  },
  {
    id: "educational",
    name: "Educational",
    description: "Agents focused on teaching and learning",
    icon: "GraduationCap",
  },
  {
    id: "creative",
    name: "Creative Expression",
    description: "Agents focused on artistic and creative expressions",
    icon: "Palette",
  },
  {
    id: "meta",
    name: "Meta Agents",
    description:
      "Agents that coordinate other agents and manage the overall experience",
    icon: "Network",
  },
];

/**
 * Agent Registry - All available agents
 */
// Get base tools that are available to all agents
const baseTools = [getToolById("verseReference")!];

export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "song-wisdom",
    name: "Song Wisdom",
    description: "Your conversational guide to finding spiritual meaning in music",
    longDescription:
      "Like a wise friend who loves both music and spirituality, this agent helps you discover deeper meaning in your favorite songs. Through natural conversation, it explores how lyrics connect to Quranic wisdom, offering insights that enrich both your musical appreciation and spiritual journey.",
    icon: "Music",
    iconColor: "#0EA5E9",
    backgroundColor: "#F0F9FF",
    capabilities: [
      {
        id: "lyrics-analysis",
        name: "Lyrics Analysis",
        description: "Analyzes song lyrics for themes and emotions",
        icon: "FileText",
      },
      {
        id: "quran-connection",
        name: "Quranic Connection",
        description: "Connects song themes to Quranic wisdom",
        icon: "Link",
      },
      {
        id: "fetch-lyrics",
        name: "Fetch Lyrics",
        description: "Can fetch lyrics for songs",
        icon: "Search",
      },
    ],
    "suggestions": [
      "Selalu Ada di Nadimu (Original Soundtrack From JUMBO) Song - Bunga Citra Lestari",
      "Gala Bunga Matahari - Sal Priadi",
      "Gajah - Tulus",
      "Manusia Kuat - Tulus", 
      "Hati Hati di Jalan - Tulus",
      "Ruang Sendiri - Tulus",
      "Monokrom - Tulus",
    ],
    systemPrompt: generateSystemPrompt("Song Wisdom Agent", `You are a thoughtful guide who helps people discover spiritual wisdom in the music they love. Your approach is natural, insightful, and deeply empathetic.

CORE MISSION:
- Help users find meaningful spiritual connections in their favorite songs
- Bridge the gap between artistic expression and Islamic wisdom
- Provide immediate, comprehensive insights rather than step-by-step analysis
- Respect both musical artistry and spiritual seeking

CONVERSATION STYLE:
- Be warm, conversational, and genuinely interested in the user's musical tastes
- Respond in the language the user uses (casual Indonesian when appropriate)
- Focus on what resonates with the user rather than forcing a rigid analysis
- Ask follow-up questions to understand their connection to the music

IMMEDIATE ACTION RULE:
When a user mentions a specific song title (with or without artist), IMMEDIATELY proceed with the analysis using the comprehensiveSongAnalysis tool. DO NOT ask for more information or clarification unless the song title is completely unclear or ambiguous. Be proactive and start the spiritual analysis right away.

ANALYSIS APPROACH:
When a user mentions a song (even if they just say "analyze this song" or "what's the meaning of [song title]"), immediately use the comprehensiveSongAnalysis tool to provide:
- Literary and emotional analysis of the lyrics
- Spiritual themes and universal wisdom
- Relevant Quranic verses and connections
- Practical applications for daily life
- A unified message that enriches their appreciation

IMPORTANT: Always pass the user's original query/message as the "userContext" parameter when calling comprehensiveSongAnalysis. This helps the AI understand the language preference and cultural context.

RESPONSE GUIDELINES:
- Start with genuine appreciation for their musical choice
- Present insights in an engaging, accessible way
- Use the verseReference tool for additional verses if the conversation develops
- Encourage deeper reflection through thoughtful questions
- Balance artistic appreciation with spiritual wisdom
- Handle controversial content with grace while focusing on positive lessons

Remember: You're not just analyzing songs - you're helping people find meaning, connection, and spiritual growth through the music that moves them. When they mention a song, jump right into the analysis!`),
    exampleQueries: [
      "I love the song 'Hurt' by Johnny Cash. What spiritual insights can you find in it?",
      "Can you help me understand what 'Bohemian Rhapsody' means from an Islamic perspective?",
      "I'm feeling down and 'The Sound of Silence' really speaks to me. What can the Quran teach me about this?",
      "What are the main themes in 'Imagine' by John Lennon? Do they align with Islamic teachings?",
      "I want to analyze the lyrics of 'Hallelujah' - can you help me find the spiritual meaning?",
      "Kamu tau lagu 'Gajah' tulus? Apa makna spiritualnya?",
    ],
    tools: [
      ...baseTools,
      getToolById("comprehensiveSongAnalysis")!,
    ],
    isAvailable: true,
    isPopular: true,
    category: "creative",
  }
];

/**
 * Get an agent by ID
 */
export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((agent) => agent.id === id);
}

/**
 * Get agents by category
 */
export function getAgentsByCategory(category: string): AgentDefinition[] {
  return AGENT_REGISTRY.filter((agent) => agent.category === category);
}

/**
 * Get all available agents
 */
export function getAvailableAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((agent) => agent.isAvailable);
}

/**
 * Get new agents
 */
export function getNewAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((agent) => agent.isNew);
}

/**
 * Get popular agents
 */
export function getPopularAgents(): AgentDefinition[] {
  return AGENT_REGISTRY.filter((agent) => agent.isPopular);
}
