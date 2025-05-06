import type { Route } from "../+types/api/chat";
import { getSystemMessage } from "~/lib/system-prompt";

// Define the expected request body structure
interface ChatRequest {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

// Define the response structure
interface ChatResponse {
  id: string;
  choices: {
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }[];
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    // Parse the request body
    const body = await request.json() as ChatRequest;

    // Get the API key from Cloudflare environment variables
    // If not available (like in development), fall back to a dummy value
    const apiKey = context.cloudflare?.env?.OPENROUTER_API_KEY || "x";

    // Ensure we have messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Add a system message if none exists
    const messages = body.messages;
    if (!messages.some(msg => msg.role === "system")) {
      messages.unshift(getSystemMessage());
    }

    // Prepare the request to OpenRouter
    const openRouterRequest = {
      messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 500,
      model: body.model ?? "google/gemini-2.0-flash-001"
    };

    // Get the origin from the request
    const url = new URL(request.url);
    const origin = url.origin;

    // Make the request to OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": origin,
        "X-Title": "Quran Knowledge Graph"
      },
      body: JSON.stringify(openRouterRequest)
    });

    // Check if the request was successful
    if (!response.ok) {
      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json() as { error?: { message?: string } };
        console.error("OpenRouter API error:", errorData);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response:", e);
      }

      return Response.json({
        error: "Failed to get response from AI service",
        details: errorMessage
      }, { status: response.status });
    }

    try {
      // Parse and return the response
      const data = await response.json() as ChatResponse & { model?: string };
      console.log("OpenRouter API success - model used:", data.model || "unknown");
      return Response.json(data);
    } catch (e) {
      console.error("Failed to parse successful response:", e);
      return Response.json({
        error: "Failed to parse AI service response"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
