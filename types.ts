export enum Language {
  KOREAN = 'Korean',
  ENGLISH = 'English',
  JAPANESE = 'Japanese',
  CHINESE = 'Chinese (Mandarin)'
}

export interface TranslationRecord {
  id: string;
  timestamp: Date;
  sourceLang: Language;
  targetLang: Language;
  originalText: string;
  translatedText: string;
  isLoading: boolean;
  error?: string;
}

export interface ProcessingResponse {
  original: string;
  translated: string;
}
