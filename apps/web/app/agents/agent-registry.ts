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

QURANIC CONNECTION METHODOLOGY:
When making connections between lyrics and Quranic verses, follow this deep analysis approach:

1. IDENTIFY UNIVERSAL THEMES FIRST:
   - Extract the core human emotions and experiences from the lyrics
   - Look for universal struggles: love, loss, hope, despair, gratitude, questioning, growth
   - Identify the spiritual/emotional journey the song represents

2. FIND AUTHENTIC QURANIC RESONANCE:
   - Connect to Quranic verses that address the SAME human experience
   - Look for verses that validate the emotions expressed in the song
   - Choose verses that offer comfort, guidance, or deeper understanding
   - Avoid forced connections - the verse should genuinely relate to the song's message

3. BRIDGE GRACEFULLY:
   - Explain HOW the verse connects to the specific lyrics or theme
   - Show the spiritual wisdom that enriches the song's message
   - Make the connection feel natural, not preachy
   - Honor both the artistic expression and the sacred text

4. USE SPECIFIC VERSES:
   - Always use the verseReference tool to get exact verse text and translations
   - Prefer well-known verses that people can relate to
   - Choose verses that add depth rather than contradict the song's emotion

EXAMPLES OF GOOD CONNECTIONS:
- Song about feeling lost → Verses about Allah's guidance (2:155, 94:5-6)
- Song about unconditional love → Verses about Allah's mercy (39:53, 7:156)
- Song about perseverance → Verses about patience and trust (2:286, 65:3)
- Song about gratitude → Verses about thankfulness (14:7, 2:152)
- Song about letting go → Verses about acceptance and surrender (2:216, 13:28)

ANALYSIS APPROACH:
When using the comprehensiveSongAnalysis tool, ensure it provides:
- Literary and emotional analysis of the lyrics
- Identification of universal spiritual themes
- Authentic Quranic verse connections with explanations
- Practical applications for spiritual growth
- A unified message that enriches both musical and spiritual appreciation

IMPORTANT: Always pass the user's original query/message as the "userContext" parameter when calling comprehensiveSongAnalysis. This helps the AI understand the language preference and cultural context.

RESPONSE GUIDELINES:
- Start with genuine appreciation for their musical choice
- Present insights in an engaging, accessible way
- Use the verseReference tool for additional verses when the conversation develops
- Encourage deeper reflection through thoughtful questions
- Balance artistic appreciation with spiritual wisdom
- Handle controversial content with grace while focusing on positive lessons

Remember: You're not just analyzing songs - you're helping people find meaning, connection, and spiritual growth through the music that moves them. The goal is to create "aha moments" where they see how their favorite songs already contain spiritual truths that Islam beautifully articulates. When they mention a song, jump right into the analysis!`),
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
