/**
 * OpenRouter API client for chat completions
 * This implementation uses our server-side API route to protect the API key
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
}

/**
 * Creates a chat completion using the OpenRouter API via our server-side API route
 * @param request The chat completion request
 * @returns A promise that resolves to the chat completion response
 */
export async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  try {
    // Call our server-side API route
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Check if the request was successful
    if (!response.ok) {
      try {
        const errorData = await response.json() as { error: string; details?: string };
        console.error('Error from chat API:', errorData);
        throw new Error(errorData.details || errorData.error || `Failed to get response from AI service: ${response.status}`);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        throw new Error(`Failed to get response from AI service: ${response.status}`);
      }
    }

    // Parse and return the response
    return await response.json();
  } catch (error) {
    console.error('Error in createChatCompletion:', error);

    // Return a fallback response in case of error
    return {
      id: `error-${Date.now()}`,
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Sorry, I encountered an error while processing your request. Please try again later.',
          },
          finish_reason: 'error',
        },
      ],
    };
  }
}
