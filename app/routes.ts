import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";


export default [
  index("routes/home.tsx"),
  route("graph", "routes/graph.tsx"),
  route("explore", "routes/explore.tsx"),
  route("data-explorer", "routes/data-explorer.tsx"),
] satisfies RouteConfig;
