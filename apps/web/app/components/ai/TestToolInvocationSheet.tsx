"use client"

import * as React from "react"
import { Button } from "~/components/ui/button"
import { ToolInvocationSheet } from "./ToolInvocationSheet"

export function TestToolInvocationSheet() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [toolName, setToolName] = React.useState<'fetchLyrics' | 'verseReference' | 'generic'>('generic')
  const [toolState, setToolState] = React.useState<'partial-call' | 'call' | 'result'>('partial-call')

  const handleOpen = (tool: 'fetchLyrics' | 'verseReference' | 'generic') => {
    setToolName(tool)
    setToolState('partial-call')
    setIsOpen(true)
    
    // Simulate loading states
    setTimeout(() => {
      setToolState('call')
      
      setTimeout(() => {
        setToolState('result')
      }, 1500)
    }, 1000)
  }

  const sampleLyricsArgs = {
    songTitle: "Imagine",
    artist: "John Lennon"
  }

  const sampleLyricsResult = {
    title: "Imagine",
    artist: "John Lennon",
    lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us, only sky\nImagine all the people\nLiving for today...\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion, too\nImagine all the people\nLiving life in peace...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will be as one\n\nImagine no possessions\nI wonder if you can\nNo need for greed or hunger\nA brotherhood of man\nImagine all the people\nSharing all the world...\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will live as one"
  }

  const sampleVerseArgs = {
    verseReference: "2:255"
  }

  const sampleVerseResult = {
    verse_key: "2:255",
    chapter_number: 2,
    verse_number: 255,
    arabic_text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    chapter_name: "Al-Baqarah",
    translations: {
      en: {
        text: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
        translator: "Saheeh International"
      }
    }
  }

  const genericArgs = {
    param1: "value1",
    param2: "value2"
  }

  const genericResult = {
    status: "success",
    data: {
      message: "Operation completed successfully",
      timestamp: new Date().toISOString()
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Tool Invocation Sheet</h2>
      
      <div className="flex flex-col gap-2">
        <Button onClick={() => handleOpen('fetchLyrics')}>
          Open Lyrics Sheet
        </Button>
        
        <Button onClick={() => handleOpen('verseReference')}>
          Open Verse Reference Sheet
        </Button>
        
        <Button onClick={() => handleOpen('generic')}>
          Open Generic Tool Sheet
        </Button>
      </div>

      <ToolInvocationSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        toolName={toolName}
        toolState={toolState}
        args={
          toolName === 'fetchLyrics' 
            ? sampleLyricsArgs 
            : toolName === 'verseReference' 
              ? sampleVerseArgs 
              : genericArgs
        }
        result={
          toolState === 'result'
            ? (
                toolName === 'fetchLyrics' 
                  ? sampleLyricsResult 
                  : toolName === 'verseReference' 
                    ? sampleVerseResult 
                    : genericResult
              )
            : undefined
        }
      />
    </div>
  )
}
