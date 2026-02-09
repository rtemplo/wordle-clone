import type { DictionaryEntry } from "../types";

export const fetchWordDefinition = async (word: string): Promise<DictionaryEntry | undefined> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  const baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";

  try {
    const response = await fetch(`${baseUrl}${word}`, { signal: controller.signal });
    if (response.ok) {
      const definition = (await response.json()) as DictionaryEntry[];
      return definition[0];
    } else {
      throw new Error(`The server has responded with an error for word "${word}".`);
    }
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
