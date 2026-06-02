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
  created_at: string;
}

export type Player = 1 | 2;
