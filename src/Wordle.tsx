import { useCallback, useEffect, useRef, useState } from "react";
import AnswerEntry from "./components/AnswerEntry";
import ControlBar from "./components/ControlBar/ControlBar";
import DefinitionBox from "./components/DefinitionBox";
import InfoBar from "./components/InfoBar/InfoBar";
import ListAnswers from "./components/ListAnswers";
import Logo from "./components/Logo";
import WordReveal from "./components/WordReveal";
import WrongLetters from "./components/WrongLetters";
import type { DictionaryEntry, WordMatchMap } from "./types";
import "./Wordle.css";

interface WordleProps {
  words: string[];
}

const getRandomWord = (words: string[]): string => {
  return words[Math.floor(Math.random() * words.length)];
};

const Wordle: React.FC<WordleProps> = ({ words }) => {
  // Tracks the words used from the word pool.
  const [usedWords, setUsedWords] = useState<string[]>(() => [getRandomWord(words)]);
  // Maps each answer to a map of letter positions and whether they matched the current word.
  const [wordMatchMaps, setWordMatchMaps] = useState<WordMatchMap>({});
  // What the user typed in but has not yet submitted.
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  // Letters that didn't match any letter in the word.
  const [incorrectLetters, setIncorrectLetters] = useState<Set<string>>(new Set());
  const [definitionCache, setDefinitionCache] = useState<{ [key: string]: DictionaryEntry } | undefined>(undefined);
  const [showDefinition, setShowDefinition] = useState<boolean>(false);

  const wordToSolve = usedWords.at(-1) || "";
  const answers = Object.keys(wordMatchMaps);
  const wordSolved = answers.includes(wordToSolve);
  const noOfAttempts = answers.length;
  const noMoreAttempts = noOfAttempts >= 6;
  const gameFinished = wordSolved || noMoreAttempts;
  const wordEntryIncomplete = currentAnswer.length < 5;
  const wordToSolveSet = new Set(wordToSolve);
  const showIncorrectLetters = incorrectLetters.size > 0 && !gameFinished;

  const inputRef = useRef<HTMLInputElement | null>(null);

  // New Game started. Get another random word.
  const getNewWord = () => {
    let newWord = "";

    do {
      newWord = getRandomWord(words);
    } while (usedWords.includes(newWord));

    return newWord;
  };

  /**
   * This function creates a map of each unique letter in the word and the indexes they are in.
   * For example, for the word "apple", if the answer was "adore" the map would look like:
   * {
   *   a: { 0: true },
   *   p: { 1: false, 2: false },
   *   l: { 3: false },
   *   e: { 4: true }
   * }
   */
  const getAnswerMatchMap = useCallback(
    (answer: string) =>
      Array.from(wordToSolve).reduce(
        (acc, char, index) => {
          const matchedInAnswer = Array.from(answer)[index] === char;
          if (!acc[char]) acc[char] = {};
          acc[char][index] = matchedInAnswer;
          return acc;
        },
        {} as Record<string, Record<number, boolean>>,
      ),
    [wordToSolve],
  );

  const submitWord = useCallback(() => {
    const unmatchedLetters = [...currentAnswer].filter((char) => !wordToSolveSet.has(char));
    setIncorrectLetters((prev) => new Set([...prev, ...unmatchedLetters].sort()));

    setWordMatchMaps((prev) => ({
      ...prev,
      [currentAnswer]: getAnswerMatchMap(currentAnswer),
    }));

    setCurrentAnswer("");
  }, [currentAnswer, getAnswerMatchMap, wordToSolveSet]);

  useEffect(() => {
    // Blur any focused button when user starts typing so enter key works for submission only
    if (
      currentAnswer.length > 0 &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== inputRef.current
    ) {
      document.activeElement.blur();
    }
  }, [currentAnswer]);

  // Focus the hidden input when the user clicks/taps anywhere on the game layer
  const focusInput = useCallback(() => {
    if (gameFinished) return;
    inputRef.current?.focus();
  }, [gameFinished]);

  // Handle input change for typing letters
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (gameFinished) return;

      const cleaned = event.target.value
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase()
        .slice(0, 5);
      setCurrentAnswer(cleaned);
    },
    [gameFinished],
  );

  // Handle key down for Enter key submission
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (gameFinished) return;

      if (event.key === "Enter" && currentAnswer.length === 5) {
        submitWord();
      }
    },
    [currentAnswer.length, gameFinished, submitWord],
  );

  /** Global keydown listener for capturing keyboard input.
   * This was the original solution before adding the hidden input field.
   * The hidden input field was added to improve mobile device support because
   *  a mobile device virtual keyboard typically only shows when an input field is focused.
   * */
  useEffect(() => {
    const getInput = (event: KeyboardEvent) => {
      if (gameFinished) return;
      if (document.activeElement === inputRef.current) return;

      const key = event.key;

      // Ignore Enter if current answer is less than 5 letters
      if (key === "Enter" && currentAnswer.length < 5) return;
      // Submit on enter key press
      if (key === "Enter" && currentAnswer.length === 5) submitWord();

      // Handle backspace
      if (key === "Backspace") {
        setCurrentAnswer((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }

      // Accept only alpha characters (a-z, A-Z)
      if (/^[a-zA-Z]$/.test(key)) {
        setCurrentAnswer((prev) => (prev.length < 5 ? prev + key.toLowerCase() : prev));
      }
    };

    document.addEventListener("keydown", getInput);

    return () => {
      document.removeEventListener("keydown", getInput);
    };
  }, [currentAnswer, gameFinished, submitWord]);

  const resetGameHandler = () => {
    const newWord = getNewWord();
    setUsedWords((prev) => [...prev, newWord]);
    setWordMatchMaps({});
    setIncorrectLetters(new Set());
    setCurrentAnswer("");
    setDefinitionCache(undefined);
    setShowDefinition(false);
  };

  const handleGetDefinition = useCallback(
    (word: string) => {
      const fetchDefinition = async () => {
        const baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
        try {
          const response = await fetch(`${baseUrl}${word}`);
          if (!response.ok) {
            if (response.status === 404) {
              console.log(`No definition found for the word: ${word}`);
              setDefinitionCache({
                [word]: { word, phonetics: [], meanings: [], license: { name: "", url: "" }, sourceUrls: [] },
              });
              return;
            }
            throw new Error("Failed to fetch definition");
          }
          const data = (await response.json()) as DictionaryEntry[];
          setDefinitionCache({ [word]: data[0] });
        } catch (error) {
          console.error("Error fetching definition:", error);
        }
      };

      if (definitionCache?.[word]) {
        setShowDefinition(true);
        return;
      }

      fetchDefinition();
    },
    [definitionCache],
  );

  useEffect(() => {
    if (definitionCache?.[wordToSolve].meanings) {
      setShowDefinition(true);
    }
  }, [definitionCache, wordToSolve]);

  useEffect(() => {
    if (!showDefinition) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDefinition(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showDefinition]);

  return (
    <div className="gameLayer" onPointerDown={focusInput}>
      <input
        ref={inputRef}
        className="hiddenInput"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label="Word entry"
        value={currentAnswer}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
      />

      <DefinitionBox
        show={showDefinition}
        entry={definitionCache?.[wordToSolve]}
        word={wordToSolve}
        onClose={() => setShowDefinition(false)}
      />

      <WordReveal show={!gameFinished} word={wordToSolve} />

      <Logo />

      <InfoBar
        show={gameFinished}
        wordToSolve={wordToSolve}
        wordSolved={wordSolved}
        noMoreAttempts={noMoreAttempts}
        getDefinition={() => handleGetDefinition(wordToSolve)}
      />

      <div className="wordGrid">
        <ListAnswers answers={answers} wordMatchMaps={wordMatchMaps} />
        <AnswerEntry show={!gameFinished} currentAnswer={currentAnswer} />
      </div>

      <WrongLetters show={showIncorrectLetters} incorrectLetters={Array.from(incorrectLetters)} />

      <ControlBar
        gameFinished={gameFinished}
        wordEntryIncomplete={wordEntryIncomplete}
        resetGameHandler={resetGameHandler}
        submitWord={submitWord}
      />
    </div>
  );
};

export default Wordle;
