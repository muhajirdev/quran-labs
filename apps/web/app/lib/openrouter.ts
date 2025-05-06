// This is a dummy implementation of the OpenRouter API client
// In a real implementation, you would need to add your API key and proper error handling

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
}

// Sample Quran-related responses for different queries
const SAMPLE_RESPONSES: Record<string, string> = {
  default: "I'm an AI assistant specialized in the Quran. How can I help you understand the Quran better?",
  surah: "The Quran consists of 114 surahs (chapters). Each surah has a unique name and varies in length. The longest is Al-Baqarah (The Cow) and the shortest is Al-Kawthar (Abundance).",
  verse: "Verses in the Quran are called 'ayat' (singular: ayah). There are approximately 6,236 verses in the Quran, though scholars may differ slightly on the exact count due to different counting methods.",
  revelation: "The Quran was revealed to Prophet Muhammad (peace be upon him) over a period of approximately 23 years, from 610 CE to 632 CE. The revelations began when Muhammad was 40 years old.",
  structure: "The Quran is organized into 114 surahs (chapters) which are arranged roughly in order of decreasing length, with the exception of the first surah, Al-Fatiha (The Opening).",
  themes: "Major themes in the Quran include monotheism (tawhid), prophethood (nubuwwah), resurrection and afterlife (qiyamah), divine guidance, stories of previous prophets, moral and ethical teachings, and laws for personal and social conduct.",
  translation: "The Quran was originally revealed in Arabic. While it has been translated into numerous languages, these translations are considered interpretations of the meaning rather than the Quran itself, as the exact divine wording is preserved only in the original Arabic.",
  tafsir: "Tafsir refers to exegesis or commentary on the Quran. It involves explaining the meanings, context, and implications of Quranic verses. Notable works of tafsir include those by Ibn Kathir, al-Tabari, and al-Qurtubi.",
  "I'm grieving. What does the Qur'an say about loss?": "The Qur'an acknowledges grief as part of the human journey.\nAllah says:\n\n 'Indeed, We belong to Allah, and indeed to Him we will return.'\n(Surah Al-Baqarah 2:156)\n\nThe Qur'an teaches that patience (sabr) and remembrance of Allah (dhikr) are keys to healing.\nGrief is not a weakness — it is natural. Even Prophet Ya'qub (Jacob) wept so deeply for his lost son Yusuf that he lost his eyesight (Surah Yusuf 12:84).",
  grief: "The Qur'an acknowledges grief as part of the human journey.\nAllah says:\n\n 'Indeed, We belong to Allah, and indeed to Him we will return.'\n(Surah Al-Baqarah 2:156)\n\nThe Qur'an teaches that patience (sabr) and remembrance of Allah (dhikr) are keys to healing.\nGrief is not a weakness — it is natural. Even Prophet Ya'qub (Jacob) wept so deeply for his lost son Yusuf that he lost his eyesight (Surah Yusuf 12:84).",
};

// Function to get a sample response based on keywords in the query
function getSampleResponse(query: string): string {
  // Check for exact match first
  if (SAMPLE_RESPONSES[query]) {
    return SAMPLE_RESPONSES[query];
  }

  const lowercaseQuery = query.toLowerCase();

  // Then check for keyword matches
  for (const [keyword, response] of Object.entries(SAMPLE_RESPONSES)) {
    if (keyword !== 'default' && typeof keyword === 'string' && keyword.length > 3 && lowercaseQuery.includes(keyword)) {
      return response;
    }
  }

  return SAMPLE_RESPONSES.default;
}

export async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
  // In a real implementation, this would make an API call to OpenRouter
  // For now, we'll return a dummy response based on the last user message

  // Find the last user message
  const userMessages = request.messages.filter(msg => msg.role === 'user');
  const lastUserMessage = userMessages.length > 0
    ? userMessages[userMessages.length - 1].content
    : '';

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    id: `chatcmpl-${Date.now()}`,
    choices: [
      {
        message: {
          role: 'assistant',
          content: getSampleResponse(lastUserMessage),
        },
        finish_reason: 'stop',
      },
    ],
  };
}

// In a real implementation, you would add more functions for different API endpoints
