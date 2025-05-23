/**
 * Tools - Defines and implements all available tools that can be used by agents
 */

import { tool, generateObject, type LanguageModel, type ToolSet } from "ai";
import { z } from "zod";
import { fetchLyrics } from "~/lib/lyrics-api";
import { fetchVerseData } from "~/lib/quran-api";

/**
 * Tool Configuration
 */
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Schema definitions for tool inputs and outputs
export const VerseReferenceInputSchema = z.object({
  verseReference: z.string().describe("The verse reference in format chapter:verse"),
});

export const VerseReferenceOutputSchema = z.object({
  verse_key: z.string(),
  arabic_text: z.string(),
  chapter_name: z.string().optional(),
  translations: z
    .record(
      z.string(), // language key
      z.object({
        text: z.string(),
        translator: z.string(),
      })
    )
    .optional(),
  error: z.string().optional(),
});

export const LyricsInputSchema = z.object({
  songTitle: z.string().describe("The title of the song"),
  artist: z.string().optional().describe("The artist name (optional)"),
});

export const LyricsToolOutputSchema = z.object({
  title: z.string(),
  artist: z.string(),
  lyrics: z.string(),
  url: z.string().optional(),
  thumbnail: z.string().optional(),
  error: z.string().optional(),
});

// Schema for comprehensive song analysis tool
export const ComprehensiveSongAnalysisInputSchema = z.object({
  songTitle: z.string().describe("The title of the song"),
  artist: z.string().optional().describe("The artist name (optional)"),
  lyrics: z.string().optional().describe("The song lyrics if already available"),
  userContext: z.string().optional().describe("The user's original query to detect language preference"),
});

export const ComprehensiveSongAnalysisOutputSchema = z.object({
  songInfo: z.object({
    title: z.string(),
    artist: z.string(),
    lyrics: z.string(),
    thumbnail: z.string().optional(),
  }),
  
  // Dynamic slides - AI decides the flow
  slides: z.array(z.object({
    id: z.string().describe("Unique identifier for the slide"),
    title: z.string().describe("Title for this slide"),
    type: z.enum([
      "lyric_quote", 
      "emotional_reflection", 
      "quranic_wisdom", 
      "personal_story", 
      "hope_message", 
      "practical_guidance",
      "spiritual_insight"
    ]).describe("Type of content for this slide"),
    content: z.object({
      main: z.string().describe("Main content - the primary message of this slide"),
      supporting: z.string().optional().describe("Supporting text that adds depth or context"),
      quote: z.string().optional().describe("Featured quote (lyric, verse, or wisdom)"),
      attribution: z.string().optional().describe("Attribution for quotes (verse reference, song title, etc.)"),
    }),
    emotion: z.enum(["contemplative", "uplifting", "comforting", "inspiring", "reflective"]).describe("Emotional tone of this slide"),
  })).min(3).max(6).describe("3-6 slides that create the perfect storytelling flow for this song"),
});

/**
 * Tool Registry - All available tools
 */
export const TOOL_REGISTRY: Record<string, ToolConfig> = {
  // Verse reference tool - available to all agents
  verseReference: {
    id: "verseReference",
    name: "Verse Reference",
    description:
      "Reference a specific verse from the Quran by its chapter and verse number",
    enabled: true,
  },
  
  // Fetch lyrics tool - used by the Song Wisdom agent
  fetchLyrics: {
    id: "fetchLyrics",
    name: "Fetch Lyrics",
    description: "Fetch lyrics for a song by title and optionally artist",
    enabled: true,
  },

  // Comprehensive song analysis tool - the main tool for Song Wisdom agent
  comprehensiveSongAnalysis: {
    id: "comprehensiveSongAnalysis",
    name: "Comprehensive Song Analysis",
    description: "Performs complete spiritual and literary analysis of a song in one step",
    enabled: true,
  },
};

/**
 * Get a tool by ID
 */
export function getToolById(id: string): ToolConfig | undefined {
  return TOOL_REGISTRY[id];
}

/**
 * Get multiple tools by their IDs
 */
export function getToolsByIds(ids: string[]): ToolConfig[] {
  return ids
    .map(id => TOOL_REGISTRY[id])
    .filter(tool => tool !== undefined) as ToolConfig[];
}

/**
 * Get all available tools
 */
export function getAllTools(): ToolConfig[] {
  return Object.values(TOOL_REGISTRY);
}

/**
 * Get tool implementations for a specific set of tool IDs
 * 
 * @param toolIds Array of tool IDs that the agent can use
 * @param llm Language model instance for AI-powered tool operations
 * @param env Cloudflare environment for accessing KV and other services
 * @returns A set of tool implementations
 */
export function getToolImplementations(toolIds: string[], llm: LanguageModel, env?: Env): ToolSet {
  const allTools = getAllToolImplementations(llm, env);
  
  // Filter tools based on provided tool IDs
  const filteredTools: ToolSet = {};
  
  for (const id of toolIds) {
    if (id in allTools) {
      filteredTools[id] = allTools[id];
    }
  }
  
  return filteredTools;
}

/**
 * Get all tool implementations
 * 
 * @param llm Language model instance for AI-powered tool operations
 * @param env Cloudflare environment for accessing KV and other services
 * @returns A set of all tool implementations
 */
export function getAllToolImplementations(llm: LanguageModel, env?: Env): ToolSet {
  return {
    // Verse reference tool
    verseReference: tool({
      description: TOOL_REGISTRY.verseReference.description,
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

    // Fetch lyrics tool
    fetchLyrics: tool({
      description: TOOL_REGISTRY.fetchLyrics.description,
      parameters: LyricsInputSchema,
      execute: async ({ songTitle, artist }) => {
        try {
          // Pass KV namespace from environment if available
          const lyricsData = await fetchLyrics(songTitle, artist, env?.superquran);
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
    }),

    // Comprehensive song analysis tool - combines everything into one powerful analysis
    comprehensiveSongAnalysis: tool({
      description: TOOL_REGISTRY.comprehensiveSongAnalysis.description,
      parameters: ComprehensiveSongAnalysisInputSchema,
      execute: async ({ songTitle, artist, lyrics, userContext }) => {
        try {
          let songLyrics = lyrics;
          let lyricsData = null;
          console.log(songLyrics)
          
          // Fetch lyrics if not provided
          if (!songLyrics) {
            try {
              // Pass KV namespace from environment if available
              lyricsData = await fetchLyrics(songTitle, artist, env?.superquran);
              songLyrics = lyricsData.lyrics;
              if (!songLyrics) {
                throw new Error("Could not fetch lyrics for this song");
              }
            } catch (error) {
              throw new Error(`Unable to fetch lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }

          const prompt = `Create a dynamic Instagram storytelling experience with 3-6 slides that best serves this song's spiritual journey. YOU decide the perfect flow based on the song's emotional content and spiritual themes.

QURANIC CONNECTION METHODOLOGY - FOLLOW THIS CAREFULLY:

1. IDENTIFY UNIVERSAL THEMES FIRST:
   - Extract the core human emotions and experiences from the lyrics
   - Look for universal struggles: love, loss, hope, despair, gratitude, questioning, growth, healing
   - Identify the spiritual/emotional journey the song represents
   - Don't rush to find verses - understand the song's heart first

2. FIND AUTHENTIC QURANIC RESONANCE:
   - Connect to Quranic verses that address the SAME human experience
   - Look for verses that validate the emotions expressed in the song
   - Choose verses that offer comfort, guidance, or deeper understanding
   - Avoid forced connections - the verse should genuinely relate to the song's message
   - The verse should feel like it was meant to speak to this exact feeling

3. BRIDGE GRACEFULLY:
   - Explain HOW the verse connects to the specific lyrics or theme
   - Show the spiritual wisdom that enriches the song's message
   - Make the connection feel natural, like a gentle revelation
   - Honor both the artistic expression and the sacred text
   - Use phrases like "this echoes the Quranic wisdom of..." or "just like how the Quran reminds us..."

4. EXAMPLES OF AUTHENTIC CONNECTIONS:
   - Song about feeling lost/confused → Verses about Allah's guidance (2:155, 94:5-6, 2:286)
   - Song about unconditional love → Verses about Allah's mercy (39:53, 7:156, 25:70)
   - Song about perseverance/struggle → Verses about patience and trust (2:286, 65:3, 94:5-6)
   - Song about gratitude/counting blessings → Verses about thankfulness (14:7, 2:152, 16:18)
   - Song about letting go/acceptance → Verses about surrender and trust (2:216, 13:28, 3:159)
   - Song about self-worth/identity → Verses about human dignity (17:70, 2:30, 95:4)
   - Song about healing from pain → Verses about Allah's comfort (94:5-6, 2:155, 39:53)

AVAILABLE SLIDE TYPES:
- lyric_quote: Feature powerful lyrics with personal reflection
- emotional_reflection: Connect to universal human struggles and feelings  
- quranic_wisdom: Share relevant Quranic verses with authentic connection explanation
- personal_story: Heart-to-heart understanding and validation
- hope_message: Uplifting messages of divine love and encouragement
- practical_guidance: Gentle spiritual practices or life applications
- spiritual_insight: Deep spiritual truths and revelations

YOUR CREATIVE DECISIONS:
- How many slides feel right for this song? (3-6 slides) - AIM FOR 5-6 SLIDES when possible for richer storytelling
- What's the most powerful storytelling flow for this particular song?
- Which emotional journey would resonate most with listeners?
- How should you sequence the spiritual insights for maximum impact?
- MOST IMPORTANTLY: Which Quranic verses authentically speak to this song's emotions?

EXAMPLES OF DIFFERENT FLOWS:
- Heavy/sad song (5 slides): lyric_quote → emotional_reflection → personal_story → quranic_wisdom → hope_message
- Uplifting song (6 slides): lyric_quote → spiritual_insight → emotional_reflection → quranic_wisdom → practical_guidance → hope_message
- Love/relationship song (5 slides): lyric_quote → emotional_reflection → quranic_wisdom → spiritual_insight → practical_guidance
- Life journey song (6 slides): lyric_quote → personal_story → emotional_reflection → quranic_wisdom → spiritual_insight → hope_message
- Simple/direct song (4 slides): lyric_quote → emotional_reflection → quranic_wisdom → hope_message

SLIDE COUNT GUIDANCE:
- Use 5-6 slides for most songs to create a rich, engaging experience
- Use 4 slides only for very simple or short songs
- Use 3 slides only in exceptional cases where the song is extremely brief or straightforward
- More slides allow for deeper emotional journey and better spiritual insights

Each slide should:
- Feel like a natural Instagram caption
- Flow smoothly to the next emotional beat
- Use the Instagram storytelling style with warm, relatable language
- Include quotes, attributions, and supporting context as needed
- When featuring Quranic verses, explain the connection authentically

TITLES AND QUOTES - MAKE THEM WARM AND VALIDATING:
- Use validating language that acknowledges the user's emotions: "It's okay to feel...", "Your feelings are valid...", "You're not alone in..."
- Include appropriate emojis that match the emotional tone: 💙 for comfort, 🌸 for hope, ✨ for wisdom, 🤗 for support, 💫 for inspiration
- Make titles feel like a warm hug or understanding friend
- Examples of warm, validating titles:
  * "Your Heart Knows What It Needs 💙"
  * "It's Okay to Feel Lost Sometimes ✨"
  * "You're Stronger Than You Think 🌸"
  * "Your Pain Has Purpose 💫"
  * "This Feeling Will Pass 🤗"
  * "You're Not Walking This Path Alone 💙"
- For quotes, choose the most emotionally resonant lyrics and present them with compassion
- When featuring Quranic verses, introduce them warmly: "Allah reminds us gently...", "The Quran whispers to our hearts..."

Create the most authentic and impactful spiritual storytelling experience for this specific song.

${userContext ? `User context: "${userContext}"` : ''}

SONG LYRICS:
${songLyrics}

LANGUAGE INSTRUCTION: 
Respond in the same language that feels most natural based on the user's query and the song context. Pay attention to:
- What language did the user use when asking about this song?
- Is this an Indonesian song or from Indonesian context?
- What would feel most authentic and connecting for this specific user?

If the user communicated in Bahasa Indonesia (like "analisis lagu ini" or "apa makna lagu ini"), respond entirely in casual, warm Bahasa Indonesia using "aku kamu" style (NOT "lo gue" style). Keep it natural and friendly but accessible to all Indonesian speakers. If the user used English, respond in English. Let the language flow naturally from the context.

Validate user's feeling and emotions from the song

CRITICAL: Take time to really dig deep into the spiritual meaning of the lyrics before making Quranic connections. The connections should feel profound and meaningful, not superficial. Ask yourself: "What is the heart of this song really saying?" and "Which Quranic verse genuinely speaks to this same human experience?"

WRITING STYLE GUIDELINES:
You are an Instagram content writer who specializes in heart-touching storytelling. Your writing style is warm, reflective, and conveys Islamic spiritual values subtly but meaningfully. Your approach should be:

- Start with powerful song lyrics as an opener to hook readers
- Connect to relatable emotional struggles that many people face (heartbreak, feeling lost, self-worth issues, life journey challenges)
- Link those experiences to Quranic meanings in a non-preachy but deeply touching way that feels like a gentle revelation
- Close with hopeful messages, gentle reminders about Allah, or motivation to keep faith
- Use a mix of formal-informal language that's relatable: "kamu", "aku", "gak apa-apa", while maintaining language beauty
- Avoid judgmental tone - focus on heart strengthening and finding meaning in life's journey
- Write like a compassionate friend who understands the struggle and offers gentle guidance
- Make every insight feel like a warm embrace and spiritual comfort
- Use storytelling language that paints emotional pictures people can see themselves in
- Keep content suitable for Instagram captions or carousel storytelling (concise but impactful)
- When connecting to Quranic verses, make it feel like discovering hidden treasure

Be thoughtful, respectful of both artistic expression and Islamic teachings. Use a conversational, warm tone that matches the cultural context.`;

          const { object } = await generateObject({
            model: llm,
            prompt,
            schema: ComprehensiveSongAnalysisOutputSchema,
            temperature: 0.8,
          });

          // Ensure we include the song info
          object.songInfo = {
            title: songTitle,
            artist: artist || "Unknown Artist",
            lyrics: songLyrics,
            thumbnail: lyricsData?.thumbnail,
          };

          return object;
        } catch (error) {
          console.error("Error in comprehensive song analysis:", error);
          throw error;
        }
      },
    }),
  };
}
