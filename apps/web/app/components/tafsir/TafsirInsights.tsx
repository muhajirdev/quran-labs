import React from "react";
import { Badge } from "~/components/ui/badge";

interface TafsirInsightProps {
  author: string;
  language: string;
}

export function TafsirInsights({ author, language }: TafsirInsightProps) {
  return (
    <div className="space-y-4">
      {/* Author context section */}
      <div className="bg-muted/20 rounded-md p-3 border border-border/30 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>
          <h4 className="text-sm font-medium">About this commentary</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          This interpretation is from <span className="text-primary font-medium">{author}</span>,
          a renowned scholar known for {author.includes("Jalalayn") ?
            "concise explanations focusing on the literal meaning of the text" :
            "detailed analysis of linguistic and contextual elements"}.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
            {language}
          </Badge>
          <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-muted/30 text-xs">
            Classical
          </Badge>
          <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-muted/30 text-xs">
            {getScholarPeriod(author)}
          </Badge>
        </div>
      </div>

      {/* Key insights section */}
      <div className="mt-4 pt-3 border-t border-border/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2v8" />
              <path d="m4.93 10.93 1.41 1.41" />
              <path d="M2 18h2" />
              <path d="M20 18h2" />
              <path d="m19.07 10.93-1.41 1.41" />
              <path d="M22 22H2" />
              <path d="m16 6-4 4-4-4" />
              <path d="M16 18a4 4 0 0 0-8 0" />
            </svg>
          </div>
          <h4 className="text-sm font-medium">Key insights</h4>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {getKeyInsights(author).map((insight, i) => (
            <div key={i} className="bg-muted/10 rounded-md p-2 border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer">
              <p className="text-xs">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive exploration elements */}
      <div className="mt-4 pt-3 border-t border-border/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <h4 className="text-sm font-medium">Related commentaries</h4>
        </div>

        <div className="relative">
          {/* Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

          {/* Scrollable container */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-thin pl-1">
            {getRelatedCommentaries(author).map((related, i) => (
              <div key={i} className="flex-shrink-0 bg-muted/10 rounded-md p-2 border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-colors cursor-pointer min-w-[150px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-primary">{related.author.charAt(0)}</span>
                  </div>
                  <p className="text-xs font-medium">{related.author}</p>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{related.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to generate dynamic content
function getScholarPeriod(author: string): string {
  if (author.includes("Jalalayn")) return "15th century";
  if (author.includes("Ibn Kathir")) return "14th century";
  if (author.includes("Tabari")) return "10th century";
  if (author.includes("Qurtubi")) return "13th century";
  return "Classical period";
}

function getKeyInsights(author: string): string[] {
  if (author.includes("Jalalayn")) {
    return [
      "Linguistic analysis of key terms",
      "Concise literal interpretation",
      "Focus on immediate meaning",
      "Contextual references"
    ];
  }

  if (author.includes("Ibn Kathir")) {
    return [
      "Historical context of revelation",
      "Hadith-based interpretation",
      "Scholarly consensus views",
      "Practical application"
    ];
  }

  return [
    "Linguistic analysis of key terms",
    "Historical context of revelation",
    "Theological implications",
    "Scholarly perspectives"
  ];
}

function getRelatedCommentaries(author: string): Array<{ author: string, excerpt: string }> {
  if (author.includes("Jalalayn")) {
    return [
      {
        author: "Ibn Kathir",
        excerpt: "Provides a more detailed historical context for this verse, connecting it to prophetic traditions."
      },
      {
        author: "Tabari",
        excerpt: "Offers linguistic analysis focusing on the grammatical structure and word origins."
      },
      {
        author: "Qurtubi",
        excerpt: "Discusses the legal implications and practical applications derived from this verse."
      }
    ];
  }

  if (author.includes("Ibn Kathir")) {
    return [
      {
        author: "Jalalayn",
        excerpt: "Provides a more concise explanation focusing on the literal meaning of the text."
      },
      {
        author: "Tabari",
        excerpt: "Offers a comprehensive collection of early scholarly opinions on this verse."
      },
      {
        author: "Zamakhshari",
        excerpt: "Presents a detailed rhetorical analysis highlighting the eloquence of the verse."
      }
    ];
  }

  return [
    {
      author: "Ibn Kathir",
      excerpt: "Connects this verse to relevant hadith and historical context of revelation."
    },
    {
      author: "Jalalayn",
      excerpt: "Offers a concise explanation focusing on the immediate meaning of the text."
    },
    {
      author: "Qurtubi",
      excerpt: "Explores the legal rulings and practical wisdom derived from this verse."
    }
  ];
}
