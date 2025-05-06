import type { ActionFunctionArgs, MetaFunction } from "react-router";

export namespace Route {
  export type ActionArgs = ActionFunctionArgs;
  export type MetaArgs = Parameters<MetaFunction>[0];
}
