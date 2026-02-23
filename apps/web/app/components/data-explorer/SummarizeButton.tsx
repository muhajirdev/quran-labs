import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { createChatCompletion } from '~/lib/openrouter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface SummarizeButtonProps {
  results: any;
}

export function SummarizeButton({ results }: SummarizeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractVerseData = (results: any) => {
    const verses: any[] = [];
    const topics: Set<string> = new Set();
    
    if (!results?.data || !Array.isArray(results.data)) {
      return { verses: [], topics: [] };
    }

    results.data.forEach((row: any) => {
      // Look for Verse nodes in the row
      Object.values(row).forEach((value: any) => {
        if (value && typeof value === 'object') {
          // Check if it's a Verse node
          if (value._label === 'Verse' || value.label === 'Verse') {
            const verseKey = value.verse_key || value.properties?.verse_key;
            const translationText = value.translation_text || value.properties?.translation_text;
            const tafsirText = value.tafsir_text || value.properties?.tafsir_text;
            const verseText = value.text || value.properties?.text;
            
            if (verseKey && !verses.find(v => v.verse_key === verseKey)) {
              verses.push({
                verse_key: verseKey,
                text: verseText,
                translation: translationText,
                tafsir: tafsirText
              });
            }
          }
          
          // Check if it's a Topic node
          if (value._label === 'Topic' || value.label === 'Topic') {
            const topicName = value.name || value.properties?.name;
            if (topicName) {
              topics.add(topicName);
            }
          }
        }
      });
    });

    return { verses, topics: Array.from(topics) };
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      const { verses, topics } = extractVerseData(results);
      
      if (verses.length === 0) {
        setSummary('No verse data found in the query results to summarize.');
        setLoading(false);
        return;
      }

      // Build the prompt
      let prompt = 'Please provide a comprehensive summary of the following Quranic verses and their themes:\n\n';
      
      if (topics.length > 0) {
        prompt += `**Topics:** ${topics.join(', ')}\n\n`;
      }
      
      prompt += '**Verses:**\n';
      verses.forEach((verse, index) => {
        prompt += `\n${index + 1}. Verse ${verse.verse_key}:\n`;
        if (verse.text) {
          prompt += `   Arabic: ${verse.text}\n`;
        }
        if (verse.translation) {
          prompt += `   Translation: ${verse.translation}\n`;
        }
        if (verse.tafsir) {
          prompt += `   Tafsir: ${verse.tafsir.substring(0, 500)}${verse.tafsir.length > 500 ? '...' : ''}\n`;
        }
      });
      
      prompt += '\n\nPlease provide:\n';
      prompt += '1. A brief overview of the main themes\n';
      prompt += '2. Key insights and lessons\n';
      prompt += '3. How these verses connect to each other\n';
      prompt += '4. Practical applications for daily life';

      const response = await createChatCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are an Islamic scholar and Quran expert. Provide insightful, respectful, and comprehensive summaries of Quranic verses, their translations, and tafsir (classical commentary). Focus on spiritual guidance, practical wisdom, and connecting themes across verses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const summaryText = response.choices[0]?.message?.content || 'Unable to generate summary.';
      setSummary(summaryText);
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const hasVerseData = () => {
    if (!results?.data || !Array.isArray(results.data)) return false;
    
    return results.data.some((row: any) => {
      return Object.values(row).some((value: any) => {
        if (value && typeof value === 'object') {
          return (value._label === 'Verse' || value.label === 'Verse') && 
                 (value.verse_key || value.properties?.verse_key);
        }
        return false;
      });
    });
  };

  if (!hasVerseData()) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSummarize}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Summarize
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Summary
            </DialogTitle>
            <DialogDescription>
              AI-generated summary of the queried verses, translations, and tafsir
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Generating summary...</p>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <p className="text-destructive">{error}</p>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-foreground">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
