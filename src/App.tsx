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

  const currentAnswerLetters = currentAnswer.split("");
  const currentWordIndex = usedWords.length - 1;
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

      console.log("Key received in getInput:", event.key);
      console.log("Current answer before processing:", currentAnswer);
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

    if (currentAnswer === usedWords[currentWordIndex]) {
      setGameCompleted(true);
    }
  }, [currentAnswer, usedWords, currentWordIndex]);

  const getLetterBoxColorClass = useCallback(
    (char: string = "", index: number): string => {
      if (char === "") return "";

      const isInCurrentWord = usedWords[currentWordIndex].includes(char.toLowerCase());
      const isInCorrectPosition = char.toLowerCase() === usedWords[currentWordIndex][index];

      if (isInCorrectPosition) {
        return "greenLetterBox";
      } else if (isInCurrentWord) {
        return "yellowLetterBox";
      }
      return "";
    },
    [usedWords, currentWordIndex],
  );

  const disableSubmit = currentAnswer.length < 5;
  const showLetterPlaceHolder = currentAnswer.length < 1 && attempts < 6 && !gameCompleted;

  return (
    <div className="container">
      <div className="gameLayer" style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px 15px",
            backgroundColor: "#333",
            color: "transparent",
            borderRadius: "5px",
            cursor: "help",
            userSelect: "none",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "transparent")}
        >
          {usedWords[usedWords.length - 1]?.toUpperCase()}
        </div>
        <div className="title">WORDLE Clone</div>
        {gameCompleted && <div className="status">You won!</div>}
        {attempts >= 6 && <div className="status">Sorry. No more attempts.</div>}
        <div className="wordGrid">
          {answers.map((word, wordIndex) => (
            <div className="word">
              {word
                .toUpperCase()
                .split("")
                .map((char, index) => {
                  const colorClass = getLetterBoxColorClass(char, index);

                  return (
                    <div key={`ans_${wordIndex}_${char}_${index}`} className={`letterBox ${colorClass}`}>
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
                .map((_nullChar, index) => {
                  const colorClass = getLetterBoxColorClass(currentAnswerLetters[index], index);

                  return (
                    <div key={index} className={`letterBox ${colorClass}`}>
                      {currentAnswerLetters[index] ? currentAnswerLetters[index].toUpperCase() : ""}
                    </div>
                  );
                })}
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
