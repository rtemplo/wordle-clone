import { useCallback, useEffect, useRef, useState } from "react";
import "./wordle.css";

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
  const [wordMatchMaps, setWordMatchMaps] = useState<Record<string, Record<string, Record<number, boolean>>>>({});
  // What the user typed in but has not yet submitted.
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  const wordToSolve = usedWords.at(-1) || "";
  const answers = Object.keys(wordMatchMaps);
  const wordSolved = answers.includes(wordToSolve);
  const noOfAttempts = answers.length;
  const noMoreAttempts = noOfAttempts >= 6;
  const gameFinished = wordSolved || noMoreAttempts;
  const wordEntryIncomplete = currentAnswer.length < 5;
  const noEntryMade = currentAnswer.length === 0;
  const showLetterPlaceHolder = !gameFinished && noEntryMade;
  const showLetterEntry = !gameFinished && !noEntryMade;

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
    setWordMatchMaps((prev) => ({
      ...prev,
      [currentAnswer]: getAnswerMatchMap(currentAnswer),
    }));

    setCurrentAnswer("");
  }, [currentAnswer, getAnswerMatchMap]);

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

  const getLetterBoxColorClass = useCallback(
    (answer: string, char: string, index: number): string => {
      if (!answer || !char) return "";

      // Get map of character matches for the answer.
      const charPosMap = wordMatchMaps[answer] ? wordMatchMaps[answer][char] : undefined;

      // Only attempt to color if letter is in the word.
      if (charPosMap) {
        // Letter is in the correct position.
        const isInCorrectPosition = Boolean(charPosMap[index]);
        if (isInCorrectPosition) return "greenLetterBox";

        // Letter is in the word but at another position AND that position is not already matched by the same letter.
        const openPositionsInWord = Object.values(charPosMap).some((position) => position === false);
        if (openPositionsInWord) return "yellowLetterBox";
      }

      // Letter not in word.
      return "";
    },
    [wordMatchMaps],
  );

  const resetGameHandler = () => {
    const newWord = getNewWord();
    setUsedWords((prev) => [...prev, newWord]);
    setCurrentAnswer("");
  };

  return (
    <div className="gameLayer" style={{ position: "relative" }} onPointerDown={focusInput}>
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
      {!gameFinished && <div className="currentWordHint">{usedWords[usedWords.length - 1]?.toUpperCase()}</div>}
      <div className="title">fWORDLE</div>
      {wordSolved && <div className="status">🎉 You won! 🎉</div>}
      {noMoreAttempts && (
        <>
          <div className="wordReveal">{wordToSolve.toUpperCase()}</div>
          <div className="status">Sorry. No more attempts.</div>
        </>
      )}
      <div className="wordGrid">
        {answers.map((answer, wordIndex) => (
          <div key={`${answer}_${wordIndex}`} className="word">
            {Array.from(answer).map((char, charIndex) => {
              const colorClass = getLetterBoxColorClass(answer, char.toLowerCase(), charIndex);

              return (
                <div key={`ans_${wordIndex}_${char}_${charIndex}`} className={`letterBox ${colorClass}`}>
                  {char.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
        {showLetterPlaceHolder && (
          <div className="word">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="letterBox"></div>
            ))}
          </div>
        )}
        {showLetterEntry && (
          <div className="word">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="letterBox" style={{ color: "lightblue" }}>
                {currentAnswer[index]?.toUpperCase() ?? ""}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="controlBar">
        <button type="button" className="controlBarButton" onClick={resetGameHandler}>
          New Game
        </button>
        {!gameFinished && (
          <button
            type="button"
            className={`controlBarButton ${wordEntryIncomplete ? "disabledButton" : ""}`}
            onClick={submitWord}
            disabled={wordEntryIncomplete}
          >
            Submit Word
          </button>
        )}
      </div>
    </div>
  );
};

export default Wordle;
