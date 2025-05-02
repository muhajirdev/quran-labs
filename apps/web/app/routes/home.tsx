import type { Route } from "./+types/home";
import { AIChatExperience } from "~/components/ai/AIChatExperience";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Knowledge Graph" },
    { name: "description", content: "Explore the Quran through AI and knowledge graphs" },
  ];
}


export function clientLoader({ context }: Route.ClientLoaderArgs) {
  return {}
}

export default function Home({ }: Route.ComponentProps) {
  return <AIChatExperience />;
}
