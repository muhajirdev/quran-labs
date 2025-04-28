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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

interface TranslationItem {
  id: number;
  text: string;
  language: string;
  translator: string;
}

interface TranslationCompareProps {
  translations: TranslationItem[];
  selectedIds: number[];
  verseKey?: string;
  onClose?: () => void;
}

export function TranslationCompare({ translations, selectedIds, verseKey, onClose }: TranslationCompareProps) {
  const [view, setView] = useState<"table" | "side-by-side">("table");
  
  const selectedTranslations = translations.filter(t => selectedIds.includes(t.id));
  
  if (selectedTranslations.length < 2) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Select at least two translations to compare</p>
      </div>
    );
  }
  
  // Split translations into words for word-by-word comparison
  const translationWords = selectedTranslations.map(t => ({
    id: t.id,
    translator: t.translator,
    language: t.language,
    words: t.text.split(' ')
  }));
  
  // Find the translation with the most words to use as reference
  const maxWordCount = Math.max(...translationWords.map(t => t.words.length));
  
  return (
    <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
              <path d="M15 3v18" />
            </svg>
          </div>
          <h3 className="font-medium">Translation Comparison</h3>
          {verseKey && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-normal">
              {verseKey}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/20 rounded-md p-0.5">
            <Button 
              variant={view === "table" ? "default" : "ghost"} 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setView("table")}
            >
              Table
            </Button>
            <Button 
              variant={view === "side-by-side" ? "default" : "ghost"} 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setView("side-by-side")}
            >
              Side by Side
            </Button>
          </div>
          
          {onClose && (
            <Button variant="ghost" size="sm" className="h-7 w-7 rounded-full" onClick={onClose}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {view === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Translator</TableHead>
                  <TableHead>Translation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedTranslations.map((translation) => (
                  <TableRow key={translation.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{translation.translator}</span>
                        <span className="text-xs text-muted-foreground">{translation.language}</span>
                      </div>
                    </TableCell>
                    <TableCell>{translation.text}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedTranslations.map((translation) => (
              <div key={translation.id} className="bg-muted/10 rounded-md p-4 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{translation.translator.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{translation.translator}</span>
                    <span className="text-xs text-muted-foreground">{translation.language}</span>
                  </div>
                </div>
                <p className="text-base leading-relaxed">{translation.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-muted/10 border-t border-border/30">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Comparing {selectedTranslations.length} translations
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
                  <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
                  <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
                  <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
                </svg>
                <span>Word-by-Word</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Word-by-Word Comparison</DialogTitle>
                <DialogDescription>
                  Compare translations word by word to see how different translators interpret the same text.
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Word #</TableHead>
                      {selectedTranslations.map(t => (
                        <TableHead key={t.id}>
                          <div className="flex flex-col">
                            <span>{t.translator}</span>
                            <span className="text-xs text-muted-foreground">{t.language}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: maxWordCount }).map((_, wordIndex) => (
                      <TableRow key={wordIndex}>
                        <TableCell className="font-medium">{wordIndex + 1}</TableCell>
                        {translationWords.map(t => (
                          <TableCell key={t.id} className={wordIndex >= t.words.length ? "text-muted-foreground italic" : ""}>
                            {wordIndex < t.words.length ? t.words[wordIndex] : "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
