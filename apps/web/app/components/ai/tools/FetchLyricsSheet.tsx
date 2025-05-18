"use client"

import * as React from "react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { ExternalLink, Music, Search } from "lucide-react"

interface FetchLyricsResultProps {
  state: string
  args: {
    songTitle?: string
    artist?: string
  }
  result?: any
}

interface ParsedLyrics {
  title: string
  artist: string
  lyrics: string
  error?: string
}

export function FetchLyricsResult({ state, args, result }: FetchLyricsResultProps) {
  const [activeSection, setActiveSection] = React.useState<'lyrics' | 'analysis'>('lyrics');

  // Parse the lyrics result
  const parseLyricsResult = (): ParsedLyrics => {
    if (!result) {
      return {
        title: args.songTitle || 'Unknown Song',
        artist: args.artist || 'Unknown Artist',
        lyrics: '',
        error: 'No lyrics data available'
      };
    }

    try {
      // If result is a string that looks like JSON, try to parse it
      if (typeof result === 'string' && result.startsWith('{') && result.endsWith('}')) {
        const parsed = JSON.parse(result);
        return {
          title: parsed.title || args.songTitle || 'Unknown Song',
          artist: parsed.artist || args.artist || 'Unknown Artist',
          lyrics: parsed.lyrics || '',
          error: parsed.error
        };
      }

      // If result is already an object
      if (typeof result === 'object') {
        return {
          title: result.title || args.songTitle || 'Unknown Song',
          artist: result.artist || args.artist || 'Unknown Artist',
          lyrics: result.lyrics || '',
          error: result.error
        };
      }

      // Otherwise, just return the string as lyrics
      return {
        title: args.songTitle || 'Unknown Song',
        artist: args.artist || 'Unknown Artist',
        lyrics: String(result)
      };
    } catch (e) {
      // If parsing fails, just return the original string as lyrics
      return {
        title: args.songTitle || 'Unknown Song',
        artist: args.artist || 'Unknown Artist',
        lyrics: typeof result === 'string' ? result : '',
        error: e instanceof Error ? e.message : 'Failed to parse lyrics'
      };
    }
  };

  const parsedResult = parseLyricsResult();

  // Format lyrics for display (replace \n with line breaks)
  const formattedLyrics = parsedResult.lyrics.replace(/\\n/g, '\n');

  // Loading state
  if (state === 'partial-call' || state === 'call') {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[200px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center mb-4 relative">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
            <span className="text-2xl relative z-10">🎵</span>
          </div>
          <div className="h-6 w-48 bg-secondary/50 dark:bg-accent/20 rounded-md mb-2"></div>
          <div className="h-4 w-32 bg-secondary/30 dark:bg-accent/10 rounded-md"></div>
          <div className="mt-8 space-y-3 w-full max-w-md">
            <div className="h-20 bg-secondary/50 dark:bg-black/30 rounded-md w-full border border-border/50 dark:border-[rgba(58,58,58,0.5)]"></div>
            <div className="h-24 bg-secondary/50 dark:bg-black/30 rounded-md w-full border border-border/50 dark:border-[rgba(58,58,58,0.5)]"></div>
            <div className="h-4 bg-secondary/30 dark:bg-accent/10 rounded-md w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (parsedResult.error && !formattedLyrics) {
    return (
      <div className="p-4">
        <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-6">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mr-4 relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-destructive rounded-full blur-[6px] opacity-30"></div>
              <span className="text-2xl relative z-10">⚠️</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground dark:text-white">Lyrics Not Found</h3>
              <p className="text-sm text-muted-foreground dark:text-white/60">{parsedResult.title} - {parsedResult.artist}</p>
            </div>
          </div>
          <div className="bg-secondary/50 dark:bg-black/30 rounded-md p-5 border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <p className="text-sm text-foreground dark:text-white/80">
              {parsedResult.error}
            </p>
          </div>
          <div className="mt-5">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${parsedResult.title} ${parsedResult.artist} lyrics`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors text-sm"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search for lyrics online</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-secondary/30 dark:bg-black/20 border border-border dark:border-[rgba(58,58,58,0.7)] rounded-lg p-6">
        {/* Header with song info */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mr-4 relative group">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-accent rounded-full blur-[6px] opacity-30"></div>
            <span className="text-2xl relative z-10">🎵</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground dark:text-white">{parsedResult.title}</h3>
            <p className="text-sm text-muted-foreground dark:text-white/60">{parsedResult.artist}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50 dark:border-white/10 mb-5">
          <button
            className={cn(
              "pb-2 px-4 text-sm font-medium transition-colors relative",
              activeSection === 'lyrics'
                ? "text-foreground dark:text-white"
                : "text-muted-foreground dark:text-white/50 hover:text-foreground/70 dark:hover:text-white/70"
            )}
            onClick={() => setActiveSection('lyrics')}
          >
            Lyrics
            {activeSection === 'lyrics' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></span>
            )}
          </button>
          <button
            className={cn(
              "pb-2 px-4 text-sm font-medium transition-colors relative",
              activeSection === 'analysis'
                ? "text-foreground dark:text-white"
                : "text-muted-foreground dark:text-white/50 hover:text-foreground/70 dark:hover:text-white/70"
            )}
            onClick={() => setActiveSection('analysis')}
          >
            Analysis
            {activeSection === 'analysis' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent"></span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeSection === 'lyrics' ? (
          <div className="bg-secondary/50 dark:bg-black/30 rounded-md p-5 overflow-y-auto max-h-[400px] border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <pre className="text-sm text-foreground dark:text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
              {formattedLyrics}
            </pre>
          </div>
        ) : (
          <div className="bg-secondary/50 dark:bg-black/30 rounded-md p-5 border border-border/50 dark:border-[rgba(58,58,58,0.5)]">
            <div className="flex items-center gap-2 mb-3">
              <Music className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-medium text-foreground dark:text-white">Song Analysis</h4>
            </div>
            <p className="text-sm text-foreground dark:text-white/80 leading-relaxed">
              This song explores themes that may relate to Quranic wisdom. The lyrics can be analyzed
              for connections to spiritual concepts, ethical teachings, and reflections on human nature
              that align with Islamic principles.
            </p>
            <div className="mt-4 pt-4 border-t border-border/50 dark:border-white/10">
              <p className="text-xs text-muted-foreground dark:text-white/50 italic">
                For a deeper analysis of how this song connects to Quranic wisdom,
                ask the AI about specific themes or verses that might relate to these lyrics.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 text-xs text-muted-foreground dark:text-white/40 flex justify-between items-center">
          <span>Lyrics may be subject to copyright</span>
          <span>{formattedLyrics.split('\n').length} lines</span>
        </div>
      </div>
    </div>
  );
}
