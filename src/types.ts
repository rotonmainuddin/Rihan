export type TabId = 'bangla' | 'english' | 'math' | 'arabic' | 'board' | 'balloon';

export interface BanglaLetter {
  letter: string;
  word: string;
  emoji: string;
  speech: string;
  color: string;
}

export interface Rhyme {
  id: string;
  title: string;
  subtitle: string;
  emojis: string[];
  accentColor: string;
  bgTint: string;
  lang: 'bn-BD' | 'en-US';
  lines: string[];
}

export interface EnglishLetter {
  upper: string;
  lower: string;
  word: string;
  phonics: string;
  emoji: string;
  speech: string;
  color: string;
}

export interface ArabicLetter {
  letter: string;
  nameBn: string;
  nameEn: string;
  speech: string;
  color: string;
}

export interface DuaItem {
  id: string;
  titleBn: string;
  titleEn: string;
  arabic: string;
  pronunciationBn: string;
  meaningBn: string;
  emoji: string;
  color: string;
}

export interface ShapeItem {
  id: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'rectangle';
  nameEn: string;
  nameBn: string;
}

export interface ColorItem {
  id: string;
  nameEn: string;
  nameBn: string;
  hex: string;
}
