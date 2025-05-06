import type { LoaderFunctionArgs, MetaFunction } from "react-router";

export namespace Route {
  export type MetaArgs = Parameters<MetaFunction>[0];
  export type LoaderArgs = LoaderFunctionArgs;
}
