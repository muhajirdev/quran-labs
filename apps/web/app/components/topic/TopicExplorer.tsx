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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Link } from "react-router";
import { Tag, Network, BookOpen, Lightbulb, Compass } from "lucide-react";

interface TopicExplorerProps {
  topicId: string | number;
  topicName: string;
}

export function TopicExplorer({ topicId, topicName }: TopicExplorerProps) {
  const [activeTab, setActiveTab] = useState("related");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "topic" : ""}
        onValueChange={(value) => setIsOpen(value === "topic")}
      >
        <AccordionItem value="topic" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Network className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="font-medium">Topic Explorer</h3>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                DEMO DATA
              </Badge>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal ml-auto mr-4">
              {topicName}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-5 pb-5">
            <Tabs defaultValue="related" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="related">Related</TabsTrigger>
                <TabsTrigger value="concepts">Concepts</TabsTrigger>
                <TabsTrigger value="scholars">Scholars</TabsTrigger>
              </TabsList>

              <TabsContent value="related" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore topics related to {topicName} in the Quran.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {getRelatedTopics().map((category, i) => (
                    <div key={i} className="bg-muted/10 rounded-md border border-border/30 overflow-hidden hover:border-primary/30 transition-colors group">
                      <div className="px-3 py-2 bg-muted/20 border-b border-border/30 flex items-center justify-between">
                        <h4 className="text-sm font-medium">{category.category}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                          {category.topics.length}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {category.topics.map((topic, j) => (
                            <Link key={j} to={`/topic/${topic.id}`}>
                              <Badge
                                variant="outline"
                                className="bg-background hover:bg-primary/5 cursor-pointer transition-colors"
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
                <div className="text-sm text-muted-foreground mb-3">
                  Discover key concepts related to {topicName} in Islamic thought.
                </div>

                <Accordion type="multiple" className="w-full">
                  {getRelatedConcepts().map((concept, i) => (
                    <AccordionItem key={i} value={`concept-${i}`} className="border-b border-border/30">
                      <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-muted/10 rounded-md data-[state=open]:bg-muted/5">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lightbulb className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{concept.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <p className="text-sm text-muted-foreground mb-2">{concept.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {concept.related_verses.map((verse, j) => (
                            <Link key={j} to={`/verse/${verse}`}>
                              <Badge variant="outline" className="bg-muted/10 hover:bg-primary/5 cursor-pointer transition-colors">
                                {verse}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="scholars" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore scholarly perspectives on {topicName}.
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {getScholarlyPerspectives().map((scholar, i) => (
                    <div key={i} className="bg-muted/10 rounded-md border border-border/30 p-3 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-sm font-medium text-primary">{scholar.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">{scholar.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{scholar.period}</p>
                          <p className="text-sm">{scholar.perspective}</p>
                          {scholar.source && (
                            <p className="text-xs text-muted-foreground mt-2 italic">Source: {scholar.source}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-6">
              <Button className="gap-1.5">
                <Compass className="h-4 w-4" />
                {activeTab === "related" && "Explore Topic Network"}
                {activeTab === "concepts" && "Explore All Concepts"}
                {activeTab === "scholars" && "Explore All Perspectives"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
