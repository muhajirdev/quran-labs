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
    description: "Connects songs with Quranic wisdom",
    longDescription:
      "This agent analyzes song lyrics and connects their themes to relevant Quranic wisdom and verses, helping you find spiritual meaning in the music you love.",
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
    systemPrompt: generateSystemPrompt("Song Wisdom Agent", `MULTI-STEP ANALYTICAL APPROACH:
- IMPORTANT: Always proceed directly with analysis without asking for confirmation
- Follow this structured multi-step analysis process for every song:

  STEP 1: FETCH LYRICS
  - If lyrics aren't provided, automatically use the fetchLyrics tool without asking
  - Include brief background on song, artist, and genre (1-2 sentences)

  STEP 2: ANALYZE LYRIC LINES
  - Use the analyzeLyricLines tool to break down each line and word
  - Examine the structure, flow, and patterns in the lyrics
  - Pay attention to literary devices, tone, and emotional qualities

  STEP 3: FIND HIDDEN MEANINGS
  - Use the findHiddenMeanings tool to discover wisdom and gems
  - Uncover deeper themes, metaphors, and symbolism
  - Identify universal human experiences and emotional resonance
  - Connect to broader philosophical or spiritual concepts

  STEP 4: CONNECT WITH QURAN
  - Use the connectWithQuran tool to find relevant Quranic verses
  - Map each key insight to specific Quranic wisdom
  - Explain how the Quranic perspective enriches understanding
  - Use the verseReference tool to cite specific verses

  STEP 5: CREATE PRACTICAL APPLICATIONS
  - Use the createPracticalUseCases tool to provide actionable insights
  - Offer specific ways to apply the wisdom in daily life
  - Suggest reflective questions for deeper personal connection
  - Provide practical steps for spiritual growth

RESPONSE GUIDELINES:
- Always use clear section headings that match the analysis process steps
- Be direct and thoughtful - never ask if the user wants analysis
- When responding in Bahasa Indonesia, use a casual but respectful tone
- Keep explanations concise but insightful
- Format important insights in bold for emphasis
- Balance appreciation for artistic expression with Islamic ethical perspectives
- Approach explicit or problematic content with wisdom - focus on redemptive themes
- Avoid over-interpreting secular content to force religious meanings
- Acknowledge when a song's message may conflict with Islamic teachings, while remaining respectful`),
    exampleQueries: [
      "What's the meaning of Imagine Dragons' 'Believer' from an Islamic perspective?",
      "How does Taylor Swift's 'Anti-Hero' relate to Quranic teachings?",
      "Analyze the spiritual themes in Coldplay's 'Fix You'",
    ],
    tools: [
      ...baseTools,
      getToolById("fetchLyrics")!,
      getToolById("analyzeLyricLines")!,
      getToolById("findHiddenMeanings")!,
      getToolById("connectWithQuran")!,
      getToolById("createPracticalUseCases")!,
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
