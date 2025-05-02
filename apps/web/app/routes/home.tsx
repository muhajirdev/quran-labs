import type { Route } from "./+types/home";
import { AIChatExperience } from "~/components/ai/AIChatExperience";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Knowledge Graph" },
    { name: "description", content: "Explore the Quran through AI and knowledge graphs" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE || "Welcome to Quran Knowledge Graph" };
}

export default function Home({ }: Route.ComponentProps) {
  return <AIChatExperience />;
}
