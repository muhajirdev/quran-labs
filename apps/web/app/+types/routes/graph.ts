// Type definitions for the graph route
import type * as T from "react-router/route-module";
import type { Info as Parent0 } from "../root";

type Module = typeof import("../../routes/graph");

export type Info = {
  parents: [Parent0];
  id: "routes/graph";
  file: "routes/graph.tsx";
  path: "graph";
  params: {} & { [key: string]: string | undefined };
  module: Module;
  loaderData: T.CreateLoaderData<Module>;
  actionData: T.CreateActionData<Module>;
};

export namespace Route {
  export type LinkDescriptors = T.LinkDescriptors;
  export type LinksFunction = () => LinkDescriptors;

  export type MetaArgs = T.CreateMetaArgs<Info>;
  export type MetaDescriptors = T.MetaDescriptors;
  export type MetaFunction = (args: MetaArgs) => MetaDescriptors;

  export type HeadersArgs = T.HeadersArgs;
  export type HeadersFunction = (args: HeadersArgs) => Headers | HeadersInit;

  export type LoaderArgs = T.CreateLoaderArgs<Info>;
  export type LoaderFunction = T.CreateLoaderFunction<Info>;

  export type ActionArgs = T.CreateActionArgs<Info>;
  export type ActionFunction = T.CreateActionFunction<Info>;

  export type ShouldRevalidateArgs = T.CreateShouldRevalidateArgs<Info>;
  export type ShouldRevalidateFunction = T.CreateShouldRevalidateFunction<Info>;

  export type ErrorBoundaryProps = T.CreateErrorBoundaryProps<Info>;
  export type ErrorBoundaryComponent = T.CreateErrorBoundaryComponent<Info>;

  export type ComponentProps = T.CreateComponentProps<Info>;
  export type Component = T.CreateComponent<Info>;
}
