// Type definitions for the journey route
import type * as T from "react-router/route-module";
import type { Info as Parent0 } from "../root";

type Module = typeof import("../../routes/journey");

export type Info = {
  parents: [Parent0];
  id: "routes/journey";
  file: "routes/journey.tsx";
  path: "journey";
  params: {} & { [key: string]: string | undefined };
  module: Module;
  loaderData: T.CreateLoaderData<Module>;
  actionData: T.CreateActionData<Module>;
};
