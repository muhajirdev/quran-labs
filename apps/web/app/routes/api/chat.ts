import type { Route } from "../+types/api/chat";
import { createMetaAgent } from "~/agents/meta-agent";
import type { MetaAgentRequest } from "~/agents/meta-agent";

export async function action({ request, context }: Route.ActionArgs) {
  try {
    // Parse the request body
    const body = await request.json() as MetaAgentRequest;

    // Get the API key from Cloudflare environment variables
    // If not available (like in development), fall back to a dummy value
    const apiKey = context.cloudflare?.env?.OPENROUTER_API_KEY || "x";

    // Ensure we have messages
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Create the meta agent
    const metaAgent = createMetaAgent(apiKey);

    // Process the request with the meta agent
    console.log("Processing request with meta agent");
    const response = await metaAgent.processRequest({
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 500,
      model: body.model
    });

    // Return the response
    return Response.json(response);
  } catch (error) {
    console.error("Error in chat API:", error);

    // Return a formatted error response
    return Response.json({
      id: `error-${Date.now()}`,
      choices: [
        {
          message: {
            role: "assistant",
            content: "Sorry, I encountered an error while processing your request. Please try again later."
          },
          finish_reason: "error"
        }
      ]
    }, { status: 200 }); // Return 200 even for errors to maintain compatibility with the client
  }
}
