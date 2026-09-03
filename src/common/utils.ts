import type { DictionaryEntry, Meaning } from "../types";

// Maps Datamuse's abbreviated part-of-speech codes to readable labels.
const PART_OF_SPEECH_LABELS: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
  u: "other",
};

interface DatamuseWord {
  word: string;
  defs?: string[];
}

export const fetchWordDefinition = async (word: string): Promise<DictionaryEntry | undefined> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const baseUrl = "https://api.datamuse.com/words";

  try {
    const response = await fetch(`${baseUrl}?sp=${encodeURIComponent(word)}&md=d&max=1`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`The server has responded with an error for word "${word}".`);
    }

    const [match] = (await response.json()) as DatamuseWord[];
    // Datamuse does fuzzy spelling matches, so confirm the returned word is an exact match with definitions.
    if (!match || match.word.toLowerCase() !== word.toLowerCase() || !match.defs?.length) {
      return undefined;
    }

    const meaningsByPartOfSpeech = new Map<string, Meaning>();
    for (const rawDef of match.defs) {
      const [pos, definition] = rawDef.split("\t");
      const partOfSpeech = PART_OF_SPEECH_LABELS[pos] ?? pos;

      let meaning = meaningsByPartOfSpeech.get(partOfSpeech);
      if (!meaning) {
        meaning = { partOfSpeech, definitions: [] };
        meaningsByPartOfSpeech.set(partOfSpeech, meaning);
      }
      meaning.definitions.push({ definition: definition?.trim() ?? "" });
    }

    return { word: match.word, meanings: Array.from(meaningsByPartOfSpeech.values()) };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log(`Fetch for definition of "${word}" aborted due to timeout.`);
    } else if (error instanceof Error) {
      console.log(`Error fetching definition for "${word}": ${error.message}`);
    } else {
      console.log(`An unknown error occurred while fetching definition for "${word}".`);
    }

    return undefined;
  } finally {
    clearTimeout(timeoutId);
  }
};
