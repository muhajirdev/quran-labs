import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { lazy, Suspense } from "react";
import { LoadingScreen } from "~/components/ui/LoadingScreen";

const AIChatExperience = lazy(() => import("../components/ai/AIChatExperience"));

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
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AIChatExperience countryCode={country} />
    </Suspense>
  );
}
