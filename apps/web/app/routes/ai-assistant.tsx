import { redirect } from "react-router";
import type { Route } from "./+types/ai-assistant";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "AI Assistant - Quran Knowledge Graph" },
    { name: "description", content: "Ask questions about the Quran and get AI-powered answers" },
  ];
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  // Redirect to the home page with the query parameter
  if (query) {
    return redirect(`/?q=${encodeURIComponent(query)}`);
  }

  // If no query, just redirect to the home page
  return redirect('/');
}

// This component will never be rendered because of the redirect
export default function AIAssistant() {
  return null;
}
