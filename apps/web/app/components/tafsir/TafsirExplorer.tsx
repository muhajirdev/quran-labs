import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

interface TafsirExplorerProps {
  verseKey: string;
}

export function TafsirExplorer({ verseKey }: TafsirExplorerProps) {
  const [activeTab, setActiveTab] = useState("scholars");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "tafsir" : ""}
        onValueChange={(value) => setIsOpen(value === "tafsir")}
      >
        <AccordionItem value="tafsir" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                  <path d="m15 9-6 6" />
                  <path d="m9 9 6 6" />
                </svg>
              </div>
              <h3 className="font-medium">Explore Interpretations</h3>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                DEMO DATA
              </Badge>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal ml-auto mr-4">
              {verseKey}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-5 pb-5">
            <Tabs defaultValue="scholars" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="scholars">Scholars</TabsTrigger>
                <TabsTrigger value="themes">Themes</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
              </TabsList>

              <TabsContent value="scholars" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore different scholarly interpretations of verse {verseKey} across time periods and traditions.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {getScholarsByPeriod().map((period, i) => (
                    <div key={i} className="bg-muted/10 rounded-md border border-border/30 overflow-hidden hover:border-primary/30 transition-colors group">
                      <div className="px-3 py-2 bg-muted/20 border-b border-border/30 flex items-center justify-between">
                        <h4 className="text-sm font-medium">{period.era}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                          {period.scholars.length}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {period.scholars.map((scholar, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="bg-background hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              {scholar}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="themes" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Discover the key themes and concepts discussed in interpretations of verse {verseKey}.
                </div>

                <Accordion type="multiple" className="w-full">
                  {getThematicCategories().map((category, i) => (
                    <AccordionItem key={i} value={`theme-${i}`} className="border-b border-border/30">
                      <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-muted/10 rounded-md data-[state=open]:bg-muted/5">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{category.icon}</span>
                          </div>
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="flex flex-wrap gap-2 mt-1">
                          {category.themes.map((theme, j) => (
                            <div
                              key={j}
                              className="bg-muted/10 rounded-md px-2.5 py-1.5 text-xs border border-border/30 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              {theme}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="languages" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore interpretations of verse {verseKey} in different languages.
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {getLanguages().map((language, i) => (
                    <div
                      key={i}
                      className="bg-muted/10 rounded-md border border-border/30 p-3 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors flex flex-col items-center justify-center text-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="text-lg font-medium text-primary">{language.code}</span>
                      </div>
                      <h4 className="text-sm font-medium">{language.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{language.count} commentaries</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-6">
              <Button className="gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                </svg>
                {activeTab === "scholars" && "Explore All Scholars"}
                {activeTab === "themes" && "Explore All Themes"}
                {activeTab === "languages" && "Explore All Languages"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Helper functions to generate dynamic content
function getScholarsByPeriod() {
  return [
    {
      era: "Classical Period (7th-13th c.)",
      scholars: ["Ibn Abbas", "Tabari", "Zamakhshari", "Qurtubi", "Ibn Kathir"]
    },
    {
      era: "Medieval Period (14th-18th c.)",
      scholars: ["Jalalayn", "Baydawi", "Ibn Ajiba", "Alusi"]
    },
    {
      era: "Modern Period (19th-20th c.)",
      scholars: ["Muhammad Abduh", "Rashid Rida", "Maududi", "Shafi"]
    },
    {
      era: "Contemporary (21st c.)",
      scholars: ["Wahbah al-Zuhayli", "Muhammad Asad", "Yusuf Ali"]
    }
  ];
}

function getThematicCategories() {
  return [
    {
      name: "Theological Concepts",
      icon: "T",
      themes: ["Divine Attributes", "Monotheism", "Prophethood", "Angels", "Afterlife", "Predestination"]
    },
    {
      name: "Legal Rulings",
      icon: "L",
      themes: ["Ritual Practices", "Dietary Laws", "Family Law", "Inheritance", "Contracts", "Criminal Law"]
    },
    {
      name: "Ethical Teachings",
      icon: "E",
      themes: ["Justice", "Compassion", "Honesty", "Patience", "Gratitude", "Humility", "Forgiveness"]
    },
    {
      name: "Historical Context",
      icon: "H",
      themes: ["Revelation Context", "Pre-Islamic Arabia", "Prophetic Biography", "Early Muslim Community"]
    }
  ];
}

function getLanguages() {
  return [
    { name: "Arabic", code: "Ar", count: 24 },
    { name: "English", code: "En", count: 12 },
    { name: "Indonesian", code: "Id", count: 8 },
    { name: "Urdu", code: "Ur", count: 6 },
    { name: "Turkish", code: "Tr", count: 5 },
    { name: "Persian", code: "Fa", count: 4 }
  ];
}
