import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toast";
import { fetchWordDefinition } from "./common/utils";
import Wordle from "./Wordle";
import { words as backupWords } from "./words";
import "./App.css";

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [wordBankLoading, setWordBankLoading] = useState<boolean>(true);
  const [dictionaryTestLoading, setDictionaryTestLoading] = useState<boolean>(true);
  const [validateWords, setValidateWords] = useState<boolean>(true);

  const fetchWords = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const url = "https://random-word-api.herokuapp.com/word?number=100&length=5";

    setWordBankLoading(true);

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
      setWordBankLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords();

    const testDictionaryApi = async () => {
      setDictionaryTestLoading(true);
      const testWord = "test";

      try {
        const definition = await fetchWordDefinition(testWord);
        if (!definition) {
          throw new Error("Dictionary API test failed. Definitions could not be fetched.");
        }
      } catch (_e) {
        toast.error("Dictionary API is not responding. Word validation will be disabled.");
        setValidateWords(false);
      } finally {
        setDictionaryTestLoading(false);
      }
    };

    testDictionaryApi();
  }, [fetchWords]);

  const isReady = !wordBankLoading && !dictionaryTestLoading && words.length > 0;
  const isLoading = wordBankLoading || dictionaryTestLoading;
  const loadingMessage = wordBankLoading
    ? "Loading word list ..."
    : dictionaryTestLoading
      ? "Testing dictionary API ..."
      : "";

  return (
    <div className="container">
      {isLoading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <div className="loader-text">{loadingMessage}</div>
        </div>
      )}

      {isReady && <Wordle words={words} validateWords={validateWords} />}
      <ToastContainer delay={3000} position="bottom-center" />
    </div>
  );
}

export default App;
