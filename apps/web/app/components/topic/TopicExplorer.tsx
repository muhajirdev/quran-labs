import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { Link } from "react-router";
import { Tag, Network, BookOpen, Lightbulb, Compass } from "lucide-react";

interface TopicExplorerProps {
  topicId: string | number;
  topicName: string;
}

export function TopicExplorer({ topicId, topicName }: TopicExplorerProps) {
  const [activeTab, setActiveTab] = useState("related");

  return (
    <div className="bg-white/[0.02] rounded-xl border border-white/5 overflow-hidden mt-6">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center">
            <Network className="h-3.5 w-3.5 text-accent" />
          </div>
          <h3 className="font-medium text-white flex items-center gap-2">
            Topic Explorer
          </h3>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
            DEMO DATA
          </Badge>
        </div>
        <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 text-xs font-normal">
          {topicName}
        </Badge>
      </div>
      <div className="p-4 pt-5 pb-5">
        <Tabs defaultValue="related" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 bg-white/5 border border-white/10 text-white/50 p-1">
            <TabsTrigger value="related" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-accent data-[state=active]:shadow-sm">Related</TabsTrigger>
            <TabsTrigger value="concepts" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-accent data-[state=active]:shadow-sm">Concepts</TabsTrigger>
            <TabsTrigger value="scholars" className="data-[state=active]:bg-[#1c1c1c] data-[state=active]:text-accent data-[state=active]:shadow-sm">Scholars</TabsTrigger>
          </TabsList>

          <TabsContent value="related" className="space-y-4">
            <div className="text-sm text-white/50 mb-3">
              Explore topics related to {topicName} in the Quran.
            </div>

            <div className="grid grid-cols-2 gap-3">
              {getRelatedTopics().map((category, i) => (
                <div key={i} className="bg-white/[0.02] rounded-md border border-white/5 overflow-hidden hover:border-accent/30 transition-colors group">
                  <div className="px-3 py-2 bg-white/[0.04] border-b border-white/5 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white group-hover:text-accent transition-colors">{category.category}</h4>
                    <Badge variant="outline" className="text-[10px] h-4 px-1 bg-accent/10 text-accent border-accent/20">
                      {category.topics.length}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5">
                      {category.topics.map((topic, j) => (
                        <Link key={j} to={`/topic/${topic.id}`}>
                          <Badge
                            variant="outline"
                            className="bg-transparent text-white/70 border-white/10 hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
                          >
                            {topic.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="concepts" className="space-y-4">
            <div className="text-sm text-white/50 mb-3">
              Discover key concepts related to {topicName} in Islamic thought.
            </div>

            <div className="space-y-4">
              {getRelatedConcepts().map((concept, i) => (
                <div key={i} className="bg-white/[0.02] rounded-md border border-white/5 p-3 hover:border-accent/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center">
                      <Lightbulb className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-white">{concept.name}</span>
                  </div>
                  <div className="pl-9">
                    <p className="text-sm text-white/70 mb-2">{concept.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {concept.related_verses.map((verse, j) => (
                        <Link key={j} to={`/verse/${verse}`}>
                          <Badge variant="outline" className="bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:text-white cursor-pointer transition-colors">
                            {verse}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scholars" className="space-y-4">
            <div className="text-sm text-white/50 mb-3">
              Explore scholarly perspectives on {topicName}.
            </div>

            <div className="grid grid-cols-1 gap-3">
              {getScholarlyPerspectives().map((scholar, i) => (
                <div key={i} className="bg-white/[0.02] rounded-md border border-white/5 p-3 hover:border-accent/30 transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm font-medium text-accent">{scholar.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-white group-hover:text-accent transition-colors">{scholar.name}</h4>
                      <p className="text-xs text-white/40 mb-2">{scholar.period}</p>
                      <p className="text-sm text-white/80">{scholar.perspective}</p>
                      {scholar.source && (
                        <p className="text-xs text-white/40 mt-2 italic">Source: {scholar.source}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-6">
          <Button variant="outline" className="gap-1.5 bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.06] hover:text-white hover:border-accent/40 shadow-sm transition-all group">
            <Compass className="h-4 w-4 text-accent group-hover:scale-110 transition-transform" />
            {activeTab === "related" && "Explore Topic Network"}
            {activeTab === "concepts" && "Explore All Concepts"}
            {activeTab === "scholars" && "Explore All Perspectives"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// WARNING: DUMMY DATA - Replace with actual API calls in production
// These helper functions generate mock data for demonstration purposes only
function getRelatedTopics() {
  return [
    {
      category: "Theological Concepts",
      topics: [
        { id: 101, name: "Divine Unity" },
        { id: 102, name: "Divine Attributes" },
        { id: 103, name: "Divine Will" },
        { id: 104, name: "Divine Mercy" }
      ]
    },
    {
      category: "Ethical Teachings",
      topics: [
        { id: 201, name: "Justice" },
        { id: 202, name: "Compassion" },
        { id: 203, name: "Honesty" },
        { id: 204, name: "Patience" }
      ]
    },
    {
      category: "Prophetic Narratives",
      topics: [
        { id: 301, name: "Prophet Muhammad" },
        { id: 302, name: "Prophet Moses" },
        { id: 303, name: "Prophet Jesus" },
        { id: 304, name: "Prophet Abraham" }
      ]
    },
    {
      category: "Eschatology",
      topics: [
        { id: 401, name: "Day of Judgment" },
        { id: 402, name: "Paradise" },
        { id: 403, name: "Hellfire" },
        { id: 404, name: "Resurrection" }
      ]
    }
  ];
}

function getRelatedConcepts() {
  return [
    {
      name: "Divine Unity",
      description: "The concept of Tawhid (Divine Unity) is central to Islamic theology, emphasizing that God is One and has no partners or equals.",
      related_verses: ["2:255", "112:1-4", "59:22-24"]
    },
    {
      name: "Prophetic Mission",
      description: "The role of prophets as messengers who convey divine guidance to humanity and serve as exemplars of righteous conduct.",
      related_verses: ["33:21", "3:144", "21:107"]
    },
    {
      name: "Moral Responsibility",
      description: "The ethical dimension of human actions and the accountability of individuals for their choices in this life and the hereafter.",
      related_verses: ["99:7-8", "18:49", "4:123-124"]
    },
    {
      name: "Divine Mercy",
      description: "God's attribute of mercy (rahma) which encompasses compassion, forgiveness, and benevolence toward creation.",
      related_verses: ["7:156", "6:12", "6:54"]
    }
  ];
}

function getScholarlyPerspectives() {
  return [
    {
      name: "Ibn Kathir",
      period: "14th century",
      perspective: "Emphasizes the importance of understanding this topic through the lens of prophetic traditions (hadith) and the practices of the early Muslim community.",
      source: "Tafsir Ibn Kathir"
    },
    {
      name: "Al-Tabari",
      period: "9th-10th century",
      perspective: "Provides a comprehensive analysis of linguistic aspects and historical context, presenting multiple interpretations without necessarily preferring one.",
      source: "Jami' al-Bayan"
    },
    {
      name: "Al-Razi",
      period: "12th-13th century",
      perspective: "Explores philosophical dimensions and rational arguments related to this topic, connecting Quranic teachings with broader intellectual traditions.",
      source: "Mafatih al-Ghayb"
    },
    {
      name: "Muhammad Asad",
      period: "20th century",
      perspective: "Offers a modern interpretation that emphasizes the ethical and spiritual dimensions of this topic, making it relevant to contemporary concerns.",
      source: "The Message of the Quran"
    }
  ];
}
