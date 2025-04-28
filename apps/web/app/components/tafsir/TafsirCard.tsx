import React from "react";
import { MessageSquare } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { TafsirInsights } from "./TafsirInsights";

interface TafsirItem {
  id: number;
  text: string;
  author: string;
  language: string;
}

interface TafsirCardProps {
  tafsirs: TafsirItem[];
}

export function TafsirCard({ tafsirs }: TafsirCardProps) {
  if (!tafsirs || tafsirs.length === 0) return null;

  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="font-medium">Commentary</h3>
        </div>

        {/* Interactive filter controls */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>Info</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64">
                <p className="font-medium mb-1">Scholarly Commentary (Tafsir)</p>
                <p className="text-muted-foreground">Explanations and interpretations of the verse by Islamic scholars</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal">
            {tafsirs.length} sources
          </Badge>
        </div>
      </div>

      {/* Collapsible commentaries with Accordion */}
      <div className="p-2">
        <Accordion type="multiple" defaultValue={["tafsir-0"]} className="w-full">
          {tafsirs.map((tafsir, index) => (
            <TafsirAccordionItem key={index} tafsir={tafsir} index={index} />
          ))}
        </Accordion>
      </div>

      {/* Enhanced exploration footer */}
      <div className="p-3 bg-muted/10 border-t border-border/30">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Click on section headers to expand/collapse commentaries</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              <span>Compare commentaries</span>
            </Button>

            <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 15h-6" />
                <path d="M15 18l3-3-3-3" />
              </svg>
              <span>View all sources</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TafsirAccordionItemProps {
  tafsir: TafsirItem;
  index: number;
}

function TafsirAccordionItem({ tafsir, index }: TafsirAccordionItemProps) {
  return (
    <AccordionItem
      value={`tafsir-${index}`}
      className="border-b border-border/30 last:border-0 overflow-hidden rounded-md mb-1 data-[state=open]:bg-muted/5"
    >
      <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/10 group">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
            <span className="text-sm font-medium text-primary">{tafsir.author.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium group-hover:text-primary transition-colors">{tafsir.author}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-normal bg-primary/5 text-primary border border-primary/10">
                {tafsir.language}
              </span>
            </span>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Main content with interactive elements */}
          <div className="text-base leading-relaxed relative group/content">
            <div
              className="prose prose-sm dark:prose-invert max-w-none prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-headings:text-foreground prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: tafsir.text }}
            />

            {/* Floating exploration tools */}
            <div className="absolute -right-2 top-0 opacity-0 group-hover/content:opacity-100 transition-opacity">
              <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-sm rounded-md border border-border p-1 shadow-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Search within text</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12h6" />
                          <path d="M22 12h-6" />
                          <path d="M12 2v6" />
                          <path d="M12 22v-6" />
                          <path d="M20 16v-4h-8v-8h-4v8H2v4h6v6h4v-6h8Z" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Explore related concepts</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                          <path d="M10 2c1 .5 2 2 2 5" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Save for later</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Use the TafsirInsights component */}
          <TafsirInsights author={tafsir.author} language={tafsir.language} />

          {/* Action footer with improved styling */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border/20">
            <div className="text-xs text-muted-foreground">
              <span className="text-primary hover:underline cursor-pointer">{tafsir.author} Collection</span>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
                        <path d="M18 13V3" />
                        <path d="M12 9 18 3" />
                        <path d="M7 13h11" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Cite</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                      </svg>
                      Explore deeper
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Discover related commentaries and analyses</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
