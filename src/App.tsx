import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { words } from "./words";

const getRandomWord = (): string => {
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

function App() {
  const [usedWords, setUsedWords] = useState<string[]>(() => [getRandomWord()]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);

  const currentAnswerLetters = Array.from(currentAnswer);
  const currentWordIndex = usedWords.length - 1;
  const currentWord = usedWords[currentWordIndex];
  const currentWordLetters = Array.from(currentWord);
  const attempts = answers.length;

  const getNewWord = () => {
    let newWord = "";

    do {
      newWord = getRandomWord();
    } while (usedWords.includes(newWord));

    return newWord;
  };

  const getInput = useCallback(
    (event: KeyboardEvent) => {
      if (gameCompleted) return;

      const key = event.key;

      // Ignore Enter if current answer is less than 5 letters
      if (key === "Enter" && currentAnswer.length < 5) return;

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
          prev + key;
          if (prev.length < 5) return prev + key.toLowerCase();
          return prev;
        });
      }
    },
    [currentAnswer, gameCompleted],
  );

  useEffect(() => {
    document.addEventListener("keydown", getInput);

    return () => {
      document.removeEventListener("keydown", getInput);
    };
  }, [getInput]);

  useEffect(() => {}, [currentAnswer]);

  const resetGameHandler = () => {
    const newWord = getNewWord();
    setUsedWords((prev) => [...prev, newWord]);
    setAnswers([]);
    setCurrentAnswer("");
    setGameCompleted(false);
  };

  const submitWordHandler = useCallback(() => {
    setAnswers((prev) => [...prev, currentAnswer]);
    setCurrentAnswer("");

    if (currentAnswer === currentWord) {
      setGameCompleted(true);
    }
  }, [currentAnswer, currentWord]);

  const getAnswerMatchMap = useCallback(
    (answer: string) =>
      currentWordLetters.reduce(
        (acc, char, index) => {
          const matchedInAnswer = Array.from(answer)[index] === char ? true : false;
          return acc[char]
            ? { ...acc, [char]: { ...acc[char], [index]: matchedInAnswer } }
            : { ...acc, [char]: { [index]: matchedInAnswer } };
        },
        {} as Record<string, Record<number, boolean>>,
      ),
    [currentWordLetters],
  );

  const getLetterBoxColorClass = useCallback(
    (answer: string, char: string, index: number): string => {
      if (!answer || !char) return "";

      const charOccurence = (currentWord.match(new RegExp(char, "gi")) || []).length;

      if (charOccurence >= 1) {
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

      return "";
    },
    [getAnswerMatchMap, currentWord],
  );

  const disableSubmit = currentAnswer.length < 5;
  const showLetterPlaceHolder = currentAnswer.length < 1 && attempts < 6 && !gameCompleted;

  return (
    <div className="container">
      <div className="gameLayer" style={{ position: "relative" }}>
        <div className="currentWordHint">{usedWords[usedWords.length - 1]?.toUpperCase()}</div>
        <div className="title">fWORDLE</div>
        {gameCompleted && <div className="status">🎉 You won! 🎉</div>}
        {attempts >= 6 && <div className="status">Sorry. No more attempts.</div>}
        <div className="wordGrid">
          {answers.map((answer, wordIndex) => (
            <div className="word">
              {answer
                .toUpperCase()
                .split("")
                .map((char, charIndex) => {
                  const colorClass = getLetterBoxColorClass(answer, char.toLowerCase(), charIndex);

                  return (
                    <div key={`ans_${wordIndex}_${char}_${charIndex}`} className={`letterBox ${colorClass}`}>
                      {char}
                    </div>
                  );
                })}
            </div>
          ))}
          {showLetterPlaceHolder && (
            <div className="word">
              <div className="letterBox"></div>
              <div className="letterBox"></div>
              <div className="letterBox"></div>
              <div className="letterBox"></div>
              <div className="letterBox"></div>
            </div>
          )}
          {!gameCompleted && attempts < 6 && currentAnswer.length > 0 && (
            <div className="word">
              {Array(5)
                .fill(null)
                .map((_nullChar, index) => (
                  <div key={index} className="letterBox" style={{ color: "lightblue" }}>
                    {currentAnswerLetters[index] ? currentAnswerLetters[index].toUpperCase() : ""}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="controlBar">
          <button type="button" className="controlBarButton" onClick={resetGameHandler}>
            New Game
          </button>
          {!gameCompleted && attempts < 6 && (
            <button
              type="button"
              className={`controlBarButton ${disableSubmit ? "disabledButton" : ""}`}
              onClick={submitWordHandler}
              disabled={disableSubmit}
            >
              Submit Word
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
