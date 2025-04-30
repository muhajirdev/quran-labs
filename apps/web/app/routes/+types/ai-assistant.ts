// Type definitions for the AI assistant route
import type * as T from "react-router/route-module";
import type { Info as Parent0 } from "../../+types/root";

type Module = typeof import("../ai-assistant");

export type Info = {
  parents: [Parent0];
  id: "routes/ai-assistant";
  file: "routes/ai-assistant.tsx";
  path: "ai-assistant";
  params: {} & { [key: string]: string | undefined };
  module: Module;
  loaderData: T.CreateLoaderData<Module>;
  actionData: T.CreateActionData<Module>;
};
