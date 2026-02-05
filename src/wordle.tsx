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

  // Tracks the users submitted answers.
  const [answers, setAnswers] = useState<string[]>([]);

  // What the user typed in but has not yet submitted.
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentWord = usedWords[usedWords.length - 1];
  const noOfAttempts = answers.length;
  const noMoreAttempts = noOfAttempts >= 6;
  const gameFinished = gameCompleted || noMoreAttempts;
  const wordEntryIncomplete = currentAnswer.length < 5;
  const noEntryMade = currentAnswer.length === 0;
  const showLetterPlaceHolder = !gameFinished && noEntryMade;
  const showLetterEntry = !gameFinished && !noEntryMade;

  // New Game started. Get another random word.
  const getNewWord = () => {
    let newWord = "";

    do {
      newWord = getRandomWord(words);
    } while (usedWords.includes(newWord));

    return newWord;
  };

  const submitWord = useCallback(() => {
    setAnswers((prev) => [...prev, currentAnswer]);
    setCurrentAnswer("");

    if (currentAnswer === currentWord) {
      setGameCompleted(true);
    }
  }, [currentAnswer, currentWord]);

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

  const focusInput = useCallback(() => {
    if (gameFinished) return;
    inputRef.current?.focus();
  }, [gameFinished]);

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

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (gameFinished) return;

      if (event.key === "Enter" && currentAnswer.length === 5) {
        submitWord();
      }
    },
    [currentAnswer.length, gameFinished, submitWord],
  );

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
        setCurrentAnswer((prev) => {
          if (prev.length > 0) return prev.slice(0, -1);
          return prev;
        });
        return;
      }

      // Accept only alpha characters (a-z, A-Z)
      if (/^[a-zA-Z]$/.test(key)) {
        setCurrentAnswer((prev) => {
          if (prev.length < 5) return prev + key.toLowerCase();
          return prev;
        });
      }
    };

    document.addEventListener("keydown", getInput);

    return () => {
      document.removeEventListener("keydown", getInput);
    };
  }, [currentAnswer, gameFinished, submitWord]);

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
      Array.from(currentWord).reduce(
        (acc, char, index) => {
          const matchedInAnswer = Array.from(answer)[index] === char;

          if (!acc[char]) {
            acc[char] = {};
          }

          acc[char][index] = matchedInAnswer;
          return acc;
        },
        {} as Record<string, Record<number, boolean>>,
      ),
    [currentWord],
  );

  const getLetterBoxColorClass = useCallback(
    (answer: string, char: string, index: number): string => {
      if (!answer || !char) return "";

      // Count occurrences of letter in word to guess
      const letterOccurrence = (currentWord.match(new RegExp(char, "gi")) || []).length;

      // Only attempt to color if letter is in the word
      if (letterOccurrence >= 1) {
        // Get map of character matches for the answer
        const answerMatchMap = getAnswerMatchMap(answer);
        const charPosMap = answerMatchMap[char];

        if (charPosMap) {
          const isInCorrectPosition = Boolean(charPosMap[index]);
          if (isInCorrectPosition) return "greenLetterBox";

          const openCharPositions = Object.values(charPosMap).some((position) => position === false);
          const availableInWord = !isInCorrectPosition && char in answerMatchMap && openCharPositions;

          if (availableInWord) return "yellowLetterBox";
        }
      }

      // letter not in word
      return "";
    },
    [getAnswerMatchMap, currentWord],
  );

  const resetGameHandler = () => {
    const newWord = getNewWord();
    setUsedWords((prev) => [...prev, newWord]);
    setAnswers([]);
    setCurrentAnswer("");
    setGameCompleted(false);
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
      {gameCompleted && <div className="status">🎉 You won! 🎉</div>}
      {noMoreAttempts && (
        <>
          <div className="wordReveal">{currentWord.toUpperCase()}</div>
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
