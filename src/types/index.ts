export interface DictionaryEntry {
  word: string;
  meanings: Meaning[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

export interface Definition {
  definition: string;
  example?: string;
}

export type WordMatchMap = Record<string, Record<string, Record<number, boolean>>>;
