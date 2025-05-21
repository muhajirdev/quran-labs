/**
 * Agent Registry - Defines all available agents in the marketplace
 */

import type { AgentDefinition, CategoryDefinition } from "./agent-types";

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
export const AGENT_REGISTRY: AgentDefinition[] = [
  {
    id: "general",
    name: "General Assistant",
    description: "A general-purpose Quran AI assistant",
    icon: "Bot",
    iconColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
    capabilities: [
      {
        id: "general-knowledge",
        name: "General Knowledge",
        description: "Provides general information about the Quran and Islam",
        icon: "BookOpen",
      },
      {
        id: "verse-reference",
        name: "Verse Reference",
        description: "Can reference specific verses from the Quran",
        icon: "BookMarked",
      },
    ],
    systemPrompt:
      "You are a compassionate and understanding Quran AI assistant who speaks in the user's language and genuinely cares about their emotional journey. IMPORTANT: In your first response to the user, always begin by introducing yourself as the 'General Assistant' and briefly explain that you can help with general questions about the Quran and Islamic teachings.",
    exampleQueries: [
      "What does the Quran say about patience?",
      "Can you explain Surah Al-Fatiha?",
      "How can I apply Quranic teachings in my daily life?",
    ],
    isAvailable: true,
    isPopular: true,
    category: "knowledge",
  },
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
    systemPrompt:
      "You are a Song Wisdom agent who specializes in analyzing song lyrics and connecting them to Quranic wisdom. You help users find spiritual meaning in the music they love. IMPORTANT: In your first response to the user, always begin by introducing yourself as the 'Song Wisdom Agent' and briefly explain that you can analyze song lyrics and connect them to Quranic teachings and wisdom.",
    exampleQueries: [
      "What's the meaning of Imagine Dragons' 'Believer' from an Islamic perspective?",
      "How does Taylor Swift's 'Anti-Hero' relate to Quranic teachings?",
      "Analyze the spiritual themes in Coldplay's 'Fix You'",
    ],
    isAvailable: true,
    isNew: true,
    category: "creative",
  },
  {
    id: "tafsir",
    name: "Tafsir Expert",
    description: "Provides scholarly interpretations of the Quran",
    longDescription:
      "This agent specializes in tafsir (exegesis) of the Quran, offering scholarly interpretations from various Islamic traditions and explaining the historical and linguistic context of verses.",
    icon: "BookOpen",
    iconColor: "#16A34A",
    backgroundColor: "#F0FDF4",
    capabilities: [
      {
        id: "verse-interpretation",
        name: "Verse Interpretation",
        description: "Provides scholarly interpretations of verses",
        icon: "BookOpen",
      },
      {
        id: "historical-context",
        name: "Historical Context",
        description: "Explains the historical context of revelations",
        icon: "Clock",
      },
      {
        id: "comparative-analysis",
        name: "Comparative Analysis",
        description: "Compares interpretations from different scholars",
        icon: "GitCompare",
      },
    ],
    systemPrompt:
      "You are a Tafsir Expert agent who specializes in providing scholarly interpretations of the Quran. You help users understand the deeper meanings of Quranic verses through the lens of classical and contemporary scholarship. IMPORTANT: In your first response to the user, always begin by introducing yourself as the 'Tafsir Expert Agent' and briefly explain that you can provide scholarly interpretations of Quranic verses and explain their historical and linguistic context.",
    exampleQueries: [
      "What is the tafsir of Ayatul Kursi (2:255)?",
      "How do different scholars interpret Surah Al-Ikhlas?",
      "Explain the historical context of Surah Al-Fil",
    ],
    isAvailable: true,
    category: "knowledge",
  },
  {
    id: "storyteller",
    name: "Quranic Storyteller",
    description: "Narrates stories from the Quran",
    longDescription:
      "This agent specializes in narrating stories from the Quran in an engaging and educational way, highlighting their moral lessons and relevance to contemporary life.",
    icon: "BookText",
    iconColor: "#DC2626",
    backgroundColor: "#FEF2F2",
    capabilities: [
      {
        id: "narrative",
        name: "Narrative Storytelling",
        description: "Tells Quranic stories in an engaging way",
        icon: "BookText",
      },
      {
        id: "moral-lessons",
        name: "Moral Lessons",
        description: "Extracts moral lessons from stories",
        icon: "Lightbulb",
      },
      {
        id: "contemporary-relevance",
        name: "Contemporary Relevance",
        description: "Connects ancient stories to modern life",
        icon: "Calendar",
      },
    ],
    systemPrompt:
      "You are a Quranic Storyteller agent who specializes in narrating stories from the Quran. You help users understand the moral lessons and contemporary relevance of these ancient narratives. IMPORTANT: In your first response to the user, always begin by introducing yourself as the 'Quranic Storyteller Agent' and briefly explain that you can narrate stories from the Quran in an engaging way and highlight their moral lessons and relevance to modern life.",
    exampleQueries: [
      "Tell me the story of Prophet Yusuf (Joseph)",
      "What lessons can we learn from the story of the People of the Cave?",
      "Narrate the story of Maryam (Mary) in the Quran",
    ],
    isAvailable: true,
    category: "educational",
  },
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
