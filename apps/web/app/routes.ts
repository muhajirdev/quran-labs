import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("graph", "routes/graph.tsx"),
  route("explore", "routes/explore.tsx"),
  route("data-explorer", "routes/data-explorer.tsx"),
  route("verse/:verse_key", "routes/verse/$verse_key.tsx"),
  route("topic/:topic_id", "routes/topic/$topic_id.tsx"),
  route("ai-assistant", "routes/ai-assistant.tsx"),
  route("logo-demo", "routes/logo-demo.tsx"),
  route("logo-usage", "routes/logo-usage.tsx"),
  route("read", "routes/read.tsx"),
  route("vision", "routes/vision.tsx"),
  route("why-knowledge-graph", "routes/why-knowledge-graph.tsx"),
  route("test-tools", "routes/test-tools.tsx"),
] satisfies RouteConfig;
