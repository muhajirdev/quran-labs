import { routeAgentRequest } from "agents";
import { createRequestHandler } from "react-router";

import { MetaAgent } from "../app/agents/meta-agent";

declare module "react-router" {
  export interface AppLoadContext {
    country?: string; // example "ID"
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/agents")) {
      return (
        (await routeAgentRequest(request, env)) ||
        Response.json({ msg: "no agent here" }, { status: 404 })
      );
    }

    return requestHandler(request, {
      country: request.cf?.country,
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;

// Export the MetaAgent class
export { MetaAgent };
