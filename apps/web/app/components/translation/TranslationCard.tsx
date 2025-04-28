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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface TranslationItem {
  id: number;
  text: string;
  language: string;
  translator: string;
}

interface TranslationCardProps {
  translations: TranslationItem[];
  verseKey?: string;
  onCompare?: (translationIds: number[]) => void;
}

export function TranslationCard({ translations, verseKey, onCompare }: TranslationCardProps) {
  const [selectedTranslations, setSelectedTranslations] = useState<number[]>([]);

  // Skip the first translation if it exists (usually the original Arabic)
  const displayTranslations = translations.length > 1 ? translations.slice(1) : translations;

  const toggleTranslationSelection = (id: number) => {
    setSelectedTranslations(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (onCompare && selectedTranslations.length > 1) {
      onCompare(selectedTranslations);
    }
  };

  if (!translations || translations.length <= 1) return null;

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="m5 8 6 6 6-6" />
              <path d="M5 16h12c.6 0 1-.4 1-1V5c0-.6-.4-1-1-1H5a1 1 0 0 0-1 1v10c0 .6.4 1 1 1z" />
            </svg>
          </div>
          <h3 className="font-medium">Translations</h3>
        </div>

        {/* Interactive filter controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span>Filter</span>
            </Button>
            <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-popover rounded-md text-xs font-normal text-popover-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="font-medium mb-1">Filter translations by:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Language
                </li>
                <li className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Translator
                </li>
              </ul>
            </div>
          </div>

          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal">
            {displayTranslations.length} translations
          </Badge>
        </div>
      </div>

      {/* Collapsible translations with Accordion */}
      <div className="p-2">
        <Accordion type="multiple" defaultValue={["translation-0"]} className="w-full">
          {displayTranslations.map((translation, index) => (
            <TranslationAccordionItem
              key={index}
              translation={translation}
              index={index}
              isSelected={selectedTranslations.includes(translation.id)}
              onToggleSelect={() => toggleTranslationSelection(translation.id)}
            />
          ))}
        </Accordion>
      </div>

      {/* Comparison and exploration footer */}
      <div className="p-3 bg-muted/10 border-t border-border/30">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Select translations to compare or explore word meanings</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs gap-1"
              disabled={selectedTranslations.length < 2}
              onClick={handleCompare}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Compare Selected ({selectedTranslations.length})</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 15h-6" />
                <path d="M15 18l3-3-3-3" />
              </svg>
              <span>View All Translations</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TranslationAccordionItemProps {
  translation: TranslationItem;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function TranslationAccordionItem({ translation, index, isSelected, onToggleSelect }: TranslationAccordionItemProps) {
  return (
    <AccordionItem
      value={`translation-${index}`}
      className="border-b border-border/30 last:border-0 overflow-hidden rounded-md mb-1 data-[state=open]:bg-muted/5"
    >
      <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/10 group">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">{translation.translator.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium group-hover:text-primary transition-colors">{translation.translator}</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-normal bg-primary/5 text-primary border border-primary/10">
              {translation.language}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-3">
        {/* Interactive text with word highlighting */}
        <div className="text-base leading-relaxed">
          {translation.text.split(' ').map((word, wordIndex) => (
            <span
              key={wordIndex}
              className="inline mx-0.5 hover:text-primary hover:underline decoration-primary/30 cursor-pointer transition-colors"
            >
              {word}
            </span>
          ))}
        </div>

        {/* Translation actions */}
        <div className="flex justify-between mt-3 pt-2 border-t border-border/20">
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect();
                    }}
                  >
                    {isSelected ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Selected
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        Select
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isSelected ? "Remove from comparison" : "Add to comparison"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                      <path d="M12 14H8" />
                      <path d="M12 10H8" />
                      <path d="M12 6H8" />
                      <path d="M17 18h.01" />
                      <path d="M17 14h.01" />
                      <path d="M13 18h.01" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Compare translations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="flex justify-between space-y-1">
                  <h4 className="font-medium">About this translator</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {translation.translator} is known for {getTranslatorInfo(translation.translator)}
                  </p>
                  <div className="flex items-center pt-2">
                    <span className="bg-primary/10 text-primary text-xs rounded-sm px-1.5 py-0.5">
                      {translation.language}
                    </span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// Helper function to generate translator information
function getTranslatorInfo(translator: string): string {
  const translatorInfo: Record<string, string> = {
    "Yusuf Ali": "providing a highly readable English translation with extensive commentary and notes.",
    "Pickthall": "creating one of the earliest English translations by a Muslim, known for its classical language.",
    "Sahih International": "offering a modern, accessible translation that aims for clarity and accuracy.",
    "Muhammad Asad": "combining scholarly research with spiritual insight in his translation and commentary.",
    "Shakir": "producing a clear translation that closely follows traditional interpretations.",
    "Dr. Ghali": "focusing on linguistic accuracy and maintaining the original Arabic sentence structure.",
    "Muhsin Khan": "incorporating extensive explanatory notes from traditional Sunni sources.",
    "Arberry": "creating a poetic translation that attempts to capture the rhythm of the original Arabic."
  };

  return translatorInfo[translator] || "providing a faithful translation of the Quranic text.";
}
