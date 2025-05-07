"use client"

import * as React from "react"
import { Button } from "~/components/ui/button"
import { ToolInvocationSheet } from "~/components/ai/ToolInvocationSheet"
import { ChatMessage } from "~/components/ai/ChatMessage"
import type { UIMessage } from "ai"

export default function TestToolsPage() {
  const [activeToolInvocation, setActiveToolInvocation] = React.useState<{
    isOpen: boolean;
    toolName: string;
    toolState: 'partial-call' | 'call' | 'result';
    args: any;
    result?: any;
  } | null>(null)

  // Sample messages with tool invocations
  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      content: "Can you analyze the lyrics of 'Imagine' by John Lennon?",
    },
    {
      id: "2",
      role: "assistant",
      content: "I'll analyze the lyrics of 'Imagine' by John Lennon for you.",
      parts: [
        {
          type: "text",
          text: "I'll analyze the lyrics of 'Imagine' by John Lennon for you. Let me fetch the lyrics first."
        },
        {
          type: "tool-invocation",
          toolInvocation: {
            toolName: "fetchLyrics",
            state: "result",
            args: {
              songTitle: "Imagine",
              artist: "John Lennon"
            },
            result: {
              title: "Imagine",
              artist: "John Lennon",
              lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us, only sky\nImagine all the people\nLiving for today\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion, too\nImagine all the people\nLiving life in peace\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will be as one\n\nImagine no possessions\nI wonder if you can\nNo need for greed or hunger\nA brotherhood of man\nImagine all the people\nSharing all the world\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will live as one"
            }
          }
        },
        {
          type: "text",
          text: "The song 'Imagine' by John Lennon is a powerful anthem that envisions a world without divisions. It asks listeners to imagine a world without borders, religions, possessions, and other sources of division that can lead to conflict.\n\nThe lyrics promote unity, peace, and equality among all people. Lennon invites us to consider a world where people live in harmony, without the artificial constructs that separate us."
        }
      ]
    },
    {
      id: "3",
      role: "user",
      content: "What does the Quran say about peace?",
    },
    {
      id: "4",
      role: "assistant",
      content: "The Quran has many verses about peace.",
      parts: [
        {
          type: "text",
          text: "The Quran has many verses about peace. Here are some notable examples:"
        },
        {
          type: "tool-invocation",
          toolInvocation: {
            toolName: "verseReference",
            state: "result",
            args: {
              verseReference: "5:16"
            },
            result: {
              verse_key: "5:16",
              arabic_text: "يَهْدِي بِهِ اللَّهُ مَنِ اتَّبَعَ رِضْوَانَهُ سُبُلَ السَّلَامِ وَيُخْرِجُهُمْ مِنَ الظُّلُمَاتِ إِلَى النُّورِ بِإِذْنِهِ وَيَهْدِيهِمْ إِلَىٰ صِرَاطٍ مُسْتَقِيمٍ",
              translations: {
                en: {
                  text: "By which Allah guides those who pursue His pleasure to the ways of peace and brings them out from darknesses into the light, by His permission, and guides them to a straight path.",
                  translator: "Sahih International"
                }
              }
            }
          }
        },
        {
          type: "text",
          text: "This verse highlights how Allah guides people to \"the ways of peace\" (subul as-salām). Peace is presented as a divine path that leads from darkness to light."
        },
        {
          type: "tool-invocation",
          toolInvocation: {
            toolName: "verseReference",
            state: "result",
            args: {
              verseReference: "8:61"
            },
            result: {
              verse_key: "8:61",
              arabic_text: "وَإِنْ جَنَحُوا لِلسَّلْمِ فَاجْنَحْ لَهَا وَتَوَكَّلْ عَلَى اللَّهِ ۚ إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ",
              translations: {
                en: {
                  text: "And if they incline to peace, then incline to it [also] and rely upon Allah. Indeed, it is He who is the Hearing, the Knowing.",
                  translator: "Sahih International"
                }
              }
            }
          }
        },
        {
          type: "text",
          text: "This verse instructs believers to incline toward peace if others do so, emphasizing the importance of peaceful resolution of conflicts when possible."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Tool Invocation Test</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Test Tool Sheets</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setActiveToolInvocation({
                isOpen: true,
                toolName: "fetchLyrics",
                toolState: "result",
                args: {
                  songTitle: "Imagine",
                  artist: "John Lennon"
                },
                result: {
                  title: "Imagine",
                  artist: "John Lennon",
                  lyrics: "Imagine there's no heaven\nIt's easy if you try\nNo hell below us\nAbove us, only sky\nImagine all the people\nLiving for today\n\nImagine there's no countries\nIt isn't hard to do\nNothing to kill or die for\nAnd no religion, too\nImagine all the people\nLiving life in peace\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will be as one\n\nImagine no possessions\nI wonder if you can\nNo need for greed or hunger\nA brotherhood of man\nImagine all the people\nSharing all the world\n\nYou may say I'm a dreamer\nBut I'm not the only one\nI hope someday you'll join us\nAnd the world will live as one"
                }
              })}
            >
              Test Lyrics Tool
            </Button>
            
            <Button 
              onClick={() => setActiveToolInvocation({
                isOpen: true,
                toolName: "verseReference",
                toolState: "result",
                args: {
                  verseReference: "2:255"
                },
                result: null
              })}
            >
              Test Verse Reference Tool
            </Button>
            
            <Button 
              onClick={() => setActiveToolInvocation({
                isOpen: true,
                toolName: "genericTool",
                toolState: "result",
                args: {
                  param1: "value1",
                  param2: "value2"
                },
                result: {
                  status: "success",
                  data: {
                    key1: "value1",
                    key2: "value2"
                  }
                }
              })}
            >
              Test Generic Tool
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Test Chat Messages with Tool Invocations</h2>
          <div className="space-y-4 bg-black/20 p-4 rounded-lg">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>
      
      {activeToolInvocation && (
        <ToolInvocationSheet
          isOpen={activeToolInvocation.isOpen}
          onClose={() => setActiveToolInvocation(null)}
          toolName={activeToolInvocation.toolName}
          toolState={activeToolInvocation.toolState}
          args={activeToolInvocation.args}
          result={activeToolInvocation.result}
        />
      )}
    </div>
  );
}
