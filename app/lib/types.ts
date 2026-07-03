export type Language = "Shona" | "Setswana";

export interface Household {
  id: string;
  passcode: string;
  p1_name: string;
  p1_lang: Language;
  p2_name: string;
  p2_lang: Language;
  p1_score: number;
  p2_score: number;
  jar_count: number;
  streak: number;
  last_active: string | null;
}

export interface Phrase {
  id: string;
  english: string;
  shona: string;
  setswana: string;
  shona_audio: string | null;
  setswana_audio: string | null;
  created_at: string;
}

export type Player = 1 | 2;

// Column name for a language's audio note.
export type AudioField = "shona_audio" | "setswana_audio";
