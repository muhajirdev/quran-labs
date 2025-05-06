import type { Route } from "./+types/home";
import { AIChatExperience } from "~/components/ai/AIChatExperience";
import { useLoaderData } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Knowledge Graph" },
    { name: "description", content: "Explore the Quran through AI and knowledge graphs" },
  ];
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  const country = context.country;
  return { country }
};

export default function Home() {
  const { country } = useLoaderData<typeof loader>();
  return <AIChatExperience countryCode={country} />;
}
