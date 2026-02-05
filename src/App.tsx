import { useCallback, useEffect, useState } from "react";
import Wordle from "./wordle";
import { words as backupWords } from "./words";
import "./App.css";

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWords = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = "https://random-word-api.herokuapp.com/word?number=100&length=5";

    setIsLoading(true);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error("The server has responded with an error.");
      }

      const data = await response.json();
      // Simulate network delay for better loading UX
      await new Promise((resolve) => setTimeout(resolve, 100));

      setWords(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        console.log("Fetch aborted due to timeout, using backup list.");
      } else if (e instanceof Error) {
        console.log(e.message, e);
      } else {
        console.log("An unknown error occurred, using backup list.");
      }

      setWords(backupWords);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const isReady = !isLoading && words.length > 0;

  return (
    <div className="container">
      {isLoading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <div className="loader-text">Loading word selection ...</div>
        </div>
      )}

      {isReady && <Wordle words={words} />}
    </div>
  );
}

export default App;
