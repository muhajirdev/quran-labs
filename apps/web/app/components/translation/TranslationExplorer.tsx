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

interface TranslationExplorerProps {
  verseKey: string;
}

export function TranslationExplorer({ verseKey }: TranslationExplorerProps) {
  const [activeTab, setActiveTab] = useState("translators");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <Accordion
        type="single"
        collapsible
        value={isOpen ? "translations" : ""}
        onValueChange={(value) => setIsOpen(value === "translations")}
      >
        <AccordionItem value="translations" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-b data-[state=open]:border-border/30 bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="m5 8 6 6 6-6" />
                  <path d="M5 16h12c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v10c0 .6.4 1 1 1z" />
                </svg>
              </div>
              <h3 className="font-medium">Explore Translations</h3>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                DEMO DATA
              </Badge>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal ml-auto mr-4">
              {verseKey}
            </Badge>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-5 pb-5">
            <Tabs defaultValue="translators" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="translators">Translators</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="approaches">Approaches</TabsTrigger>
              </TabsList>

              <TabsContent value="translators" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore different translators of verse {verseKey} and their unique approaches.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {getTranslatorsByPeriod().map((period, i) => (
                    <div key={i} className="bg-muted/10 rounded-md border border-border/30 overflow-hidden hover:border-primary/30 transition-colors group">
                      <div className="px-3 py-2 bg-muted/20 border-b border-border/30 flex items-center justify-between">
                        <h4 className="text-sm font-medium">{period.era}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/5 text-primary border-primary/20">
                          {period.translators.length}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {period.translators.map((translator, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="bg-background hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              {translator}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Explore translations of verse {verseKey} in different languages.
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
                      <p className="text-xs text-muted-foreground mt-1">{language.count} translations</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="approaches" className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Discover different translation approaches and methodologies.
                </div>

                <Accordion type="multiple" className="w-full">
                  {getTranslationApproaches().map((approach, i) => (
                    <AccordionItem key={i} value={`approach-${i}`} className="border-b border-border/30">
                      <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-muted/10 rounded-md data-[state=open]:bg-muted/5">
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">{approach.icon}</span>
                          </div>
                          <span className="text-sm font-medium">{approach.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <p className="text-sm text-muted-foreground mb-2">{approach.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {approach.examples.map((example, j) => (
                            <div
                              key={j}
                              className="bg-muted/10 rounded-md px-2.5 py-1.5 text-xs border border-border/30 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors"
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>

            <div className="flex justify-center mt-6">
              <Button className="gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 8 6 6 6-6" />
                  <path d="M5 16h12c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v10c0 .6.4 1 1 1z" />
                </svg>
                {activeTab === "translators" && "Explore All Translators"}
                {activeTab === "languages" && "Explore All Languages"}
                {activeTab === "approaches" && "Explore All Approaches"}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Helper functions to generate dynamic content
function getTranslatorsByPeriod() {
  return [
    {
      era: "Classical (Pre-1900)",
      translators: ["George Sale", "J.M. Rodwell", "E.H. Palmer", "E.M. Wherry"]
    },
    {
      era: "Early Modern (1900-1950)",
      translators: ["Muhammad Ali", "Pickthall", "Abdullah Yusuf Ali", "Muhammad Marmaduke"]
    },
    {
      era: "Modern (1950-2000)",
      translators: ["Arthur Arberry", "Muhammad Asad", "Syed Qutb", "Muhsin Khan", "Shakir"]
    },
    {
      era: "Contemporary (2000-Present)",
      translators: ["Sahih International", "Dr. Mustafa Khattab", "Dr. Ghali", "Talal Itani"]
    }
  ];
}

function getLanguages() {
  return [
    { name: "English", code: "En", count: 24 },
    { name: "Urdu", code: "Ur", count: 12 },
    { name: "Indonesian", code: "Id", count: 10 },
    { name: "French", code: "Fr", count: 8 },
    { name: "Spanish", code: "Es", count: 6 },
    { name: "Turkish", code: "Tr", count: 5 },
    { name: "Russian", code: "Ru", count: 4 },
    { name: "German", code: "De", count: 4 },
    { name: "Malay", code: "Ms", count: 3 }
  ];
}

function getTranslationApproaches() {
  return [
    {
      name: "Literal Translation",
      icon: "L",
      description: "Focuses on word-for-word translation, prioritizing fidelity to the original Arabic text over readability in the target language.",
      examples: ["Muhammad Taqi-ud-Din al-Hilali", "Dr. Ghali", "Sahih International"]
    },
    {
      name: "Dynamic Equivalence",
      icon: "D",
      description: "Aims to convey the meaning and intent of the original text in natural, fluent language, prioritizing readability and comprehension.",
      examples: ["Muhammad Asad", "Yusuf Ali", "The Clear Quran"]
    },
    {
      name: "Interpretive Translation",
      icon: "I",
      description: "Incorporates explanatory elements directly into the translation to clarify meaning, often influenced by specific theological perspectives.",
      examples: ["Muhsin Khan", "Pickthall", "Syed Qutb"]
    },
    {
      name: "Academic/Scholarly",
      icon: "A",
      description: "Prioritizes linguistic accuracy and historical context, often including extensive footnotes and commentary for academic audiences.",
      examples: ["Arthur Arberry", "A.J. Droge", "M.A.S. Abdel Haleem"]
    }
  ];
}
