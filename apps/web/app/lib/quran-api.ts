/**
 * Quran API utilities for fetching verse data from alquran.cloud
 */

// Define types for API responses
interface AlQuranResponse<T> {
  code: number;
  status: string;
  data: T;
}

interface VerseData {
  number: number;
  text: string;
  edition: {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    type: string;
  };
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { recommended: boolean; obligatory: boolean };
}

interface ChapterData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: any[];
}

interface ProcessedVerseData {
  verse_key: string;
  chapter_number: number;
  verse_number: number;
  arabic_text: string;
  chapter_name: string;
  chapter_name_arabic: string;
  juz: number;
  page: number;
  translations: {
    [key: string]: {
      text: string;
      translator: string;
    };
  };
  error?: string;
}

/**
 * Fetches verse data from alquran.cloud API
 * @param verseReference - Verse reference in format chapter:verse (e.g., '2:255')
 * @returns Processed verse data with Arabic text and translation
 */
export async function fetchVerseData(verseReference: string): Promise<ProcessedVerseData> {
  try {
    // Validate verse reference format
    if (!verseReference || !/^\d+:\d+$/.test(verseReference)) {
      throw new Error("Invalid verse key format. Expected format: chapter:verse");
    }

    // Extract chapter and verse numbers
    const [chapterNum, verseNum] = verseReference.split(':').map(Number);

    // Fetch Arabic text from alquran.cloud
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${verseReference}/quran-uthmani`);
    if (!arabicResponse.ok) {
      throw new Error(`Failed to fetch Arabic text: ${arabicResponse.statusText}`);
    }
    const arabicData = await arabicResponse.json() as AlQuranResponse<VerseData>;
    
    // Fetch English translation from alquran.cloud
    const translationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${verseReference}/en.sahih`);
    if (!translationResponse.ok) {
      throw new Error(`Failed to fetch translation: ${translationResponse.statusText}`);
    }
    const translationData = await translationResponse.json() as AlQuranResponse<VerseData>;
    
    // Fetch chapter info
    const chapterResponse = await fetch(`https://api.alquran.cloud/v1/surah/${chapterNum}`);
    if (!chapterResponse.ok) {
      throw new Error(`Failed to fetch chapter info: ${chapterResponse.statusText}`);
    }
    const chapterData = await chapterResponse.json() as AlQuranResponse<ChapterData>;
    
    // Process the verse data
    return {
      verse_key: verseReference,
      chapter_number: chapterNum,
      verse_number: verseNum,
      arabic_text: arabicData.data.text,
      chapter_name: chapterData.data.englishName,
      chapter_name_arabic: chapterData.data.name,
      juz: arabicData.data.juz,
      page: arabicData.data.page,
      translations: {
        en: {
          text: translationData.data.text,
          translator: 'Sahih International'
        }
      }
    };
  } catch (error) {
    console.error('Error fetching verse data:', error);
    
    // Extract chapter and verse numbers for the error response
    const [chapterNum, verseNum] = verseReference.split(':').map(Number);
    
    return {
      verse_key: verseReference,
      chapter_number: chapterNum || 0,
      verse_number: verseNum || 0,
      arabic_text: '',
      chapter_name: `Chapter ${chapterNum || '?'}`,
      chapter_name_arabic: '',
      juz: 0,
      page: 0,
      translations: {},
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
