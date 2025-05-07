/**
 * MetaAgent
 *
 * This agent orchestrates different specialized agents based on the user's request.
 * It detects the type of request and routes it to the appropriate specialized agent.
 */

import { DEFAULT_SYSTEM_PROMPT } from '~/lib/system-prompt';
import { createSongWisdomAgent } from './song-wisdom-agent';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Types for the meta agent
export interface MetaAgentRequest {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface MetaAgentResponse {
  id: string;
  choices: {
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }[];
}

/**
 * Detects if a request should be handled by the SongWisdomAgent using a lightweight model
 *
 * @param messages The conversation messages
 * @param apiKey The OpenRouter API key
 * @returns A promise that resolves to true if the request should be handled by the SongWisdomAgent
 */

const RequestTypeSchema = z.enum(['song_wisdom', 'general']);
async function detectRequestType(messages: MetaAgentRequest['messages'], apiKey: string): Promise<z.infer<typeof RequestTypeSchema>> {
  const openRouter = createOpenRouter({
    apiKey: apiKey,
  })

  // Get the last user message
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
  if (!lastUserMessage) return 'general';

  // Create a prompt for the routing model
  const routingPrompt = `
You are a request classifier for a Quran AI system. Your job is to determine which specialized agent should handle a user request.

User request: "${lastUserMessage.content}"

Classify this request into ONE of the following categories:
1. song_wisdom - If the user is asking about song lyrics, music meaning, or wants to connect song lyrics to Quranic wisdom
2. general - For all other Quran-related questions

Respond with ONLY the category name, nothing else.
`;

  try {

    const {object} = await generateObject({
      model: openRouter.languageModel("google/gemini-2.0-flash-001"),
      schema: z.object({
        type: RequestTypeSchema
      }),
      prompt: routingPrompt,
      temperature: 0.5,
    })

    return object.type;

  } catch (error) {
    // console.error('Error in request classification:', error);
    return 'general'; // Default to general on error
  }
}

/**
 * Extracts song information from a message using a lightweight model
 *
 * @param message The message to extract information from
 * @param apiKey The OpenRouter API key
 * @returns The extracted lyrics, song title, and artist
 */

/**
 * Creates a meta agent that orchestrates different specialized agents
 *
 * @param apiKey - OpenRouter API key (optional, will use environment variable if not provided)
 * @returns A function that processes requests and routes them to the appropriate agent
 */
export function createMetaAgent(apiKey?: string) {
  const openRouter = createOpenRouter({
    apiKey: apiKey,
  })

  // We'll use fetch directly instead of the OpenRouter provider
  // This is because we're in a server environment

  // Create specialized agents
  const songWisdomAgent = createSongWisdomAgent(apiKey);

  /**
   * Process a request and route it to the appropriate agent
   *
   * @param request The request to process
   * @returns The response from the appropriate agent
   */
  const processRequest = async (request: MetaAgentRequest): Promise<MetaAgentResponse> => {
    try {
      // Detect the request type using the lightweight model
      const requestType = await detectRequestType(request.messages, apiKey || 'x');

      // Handle the request based on its type
      if (requestType === 'song_wisdom') {
        console.log('Routing to SongWisdomAgent');

        // Pass the request to the SongWisdomAgent
        return await songWisdomAgent.processRequest({
          messages: request.messages,
          apiKey: apiKey || 'x',
          temperature: request.temperature,
          max_tokens: request.max_tokens
        });
      }

      // For general queries, use the OpenRouter provider
      console.log('Routing to general assistant');

      // Ensure there's a system message
      let messages = [...request.messages];
      if (!messages.some(msg => msg.role === 'system')) {
        messages.unshift({
          role: 'system',
          content: DEFAULT_SYSTEM_PROMPT
        });
      }

      // Process with general assistant using generateText
      const { text } = await generateText({
        model: openRouter.languageModel("google/gemini-2.0-flash-001"),
        messages,
        temperature: request.temperature ?? 0.7,
        maxTokens: request.max_tokens ?? 500,
      });

      return {
        id: `general-${Date.now()}`,
        choices: [
          {
            message: {
              role: 'assistant',
              content: text
            },
            finish_reason: 'stop'
          }
        ]
      };
    } catch (error: unknown) {
      console.error('Error in MetaAgent:', error);

      // Return a fallback response in case of error
      return {
        id: `error-${Date.now()}`,
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Sorry, I encountered an error while processing your request. Please try again later.'
            },
            finish_reason: 'error'
          }
        ]
      };
    }
  };

  return {
    processRequest
  };
}
