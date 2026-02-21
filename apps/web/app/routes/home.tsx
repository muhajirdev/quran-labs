import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { LoadingScreen } from "~/components/ui/LoadingScreen";

const GraphLandingExperience = lazy(() => import("../components/graph/GraphLandingExperience").then(module => ({ default: module.GraphLandingExperience })));

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quran Knowledge Graph" },
    { name: "description", content: "Explore the Quran through knowledge graphs" },
  ];
}

export const loader = async ({ context }: Route.LoaderArgs) => {
  const country = context.country;
  return { country }
};

export default function Home() {
  const { country } = useLoaderData<typeof loader>();
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    // Update loading message progressively to show activity
    const stages = [
      { message: "Preparing Graph Experience...", delay: 500 },
      { message: "Loading components...", delay: 1500 },
      { message: "Connecting to Knowledge Graph...", delay: 2500 },
      { message: "Almost ready...", delay: 4000 }
    ];

    // Set up sequential timers for each loading stage
    const timers = stages.map((stage, index) => {
      return setTimeout(() => {
        setLoadingStage(index + 1);
        setLoadingMessage(stage.message);
      }, stage.delay);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <Suspense fallback={<LoadingScreen message={loadingMessage} stage={loadingStage} />}>
      <GraphLandingExperience />
    </Suspense>
  );
}
