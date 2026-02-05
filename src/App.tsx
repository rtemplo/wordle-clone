import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { words } from "./words";

const getRandomWord = (): string => {
	const randomIndex = Math.floor(Math.random() * words.length);
	return words[randomIndex];
};

function App() {
	// Tracks the words used from the word pool.
	const [usedWords, setUsedWords] = useState<string[]>(() => [getRandomWord()]);
	// Tracks the users submitted answers.
	const [answers, setAnswers] = useState<string[]>([]);
	// What the user typed in but has not yet submitted.
	const [currentAnswer, setCurrentAnswer] = useState<string>("");
	const [gameCompleted, setGameCompleted] = useState<boolean>(false);

	const currentAnswerLetters = Array.from(currentAnswer);
	const currentWordIndex = usedWords.length - 1;
	const currentWord = usedWords[currentWordIndex];
	const currentWordLetters = Array.from(currentWord);
	const attempts = answers.length;

	// New Game started. Get another word.
	const getNewWord = () => {
		let newWord = "";

		do {
			newWord = getRandomWord();
		} while (usedWords.includes(newWord));

		return newWord;
	};

	const submitWordHandler = useCallback(() => {
		setAnswers((prev) => [...prev, currentAnswer]);
		setCurrentAnswer("");

		if (currentAnswer === currentWord) {
			setGameCompleted(true);
		}
	}, [currentAnswer, currentWord]);

	const getInput = useCallback(
		(event: KeyboardEvent) => {
			if (gameCompleted) return;

			const key = event.key;

			// Ignore Enter if current answer is less than 5 letters
			if (key === "Enter" && currentAnswer.length < 5) return;
			// Submit on enter key press
			if (key === "Enter" && currentAnswer.length === 5) submitWordHandler();

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
		},
		[currentAnswer, gameCompleted, submitWordHandler],
	);

	useEffect(() => {
		// Blur any focused button when user starts typing
		if (
			currentAnswer.length > 0 &&
			document.activeElement instanceof HTMLElement
		) {
			document.activeElement.blur();
		}
	}, [currentAnswer]);

	useEffect(() => {
		document.addEventListener("keydown", getInput);

		return () => {
			document.removeEventListener("keydown", getInput);
		};
	}, [getInput]);

	useEffect(() => {}, []);

	const resetGameHandler = () => {
		const newWord = getNewWord();
		setUsedWords((prev) => [...prev, newWord]);
		setAnswers([]);
		setCurrentAnswer("");
		setGameCompleted(false);
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
			currentWordLetters.reduce(
				(acc, char, index) => {
					const matchedInAnswer = Array.from(answer)[index] === char;
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

			// Count occurrences of char in word to guess
			const charOccurrence = (currentWord.match(new RegExp(char, "gi")) || [])
				.length;

			// Only attempt to color if char is in the word
			if (charOccurrence >= 1) {
				// Get map of character matches for the answer
				const answerMatchMap = getAnswerMatchMap(answer);
				const charPosMap = answerMatchMap[char];

				if (charPosMap) {
					const isInCorrectPosition = Boolean(charPosMap[index]);
					if (isInCorrectPosition) return "greenLetterBox";

					const openCharPositions = Object.values(charPosMap).some(
						(position) => position === false,
					);
					const availableInWord =
						!isInCorrectPosition && char in answerMatchMap && openCharPositions;

					if (availableInWord) return "yellowLetterBox";
				}
			}

			return "";
		},
		[getAnswerMatchMap, currentWord],
	);

	const disableSubmit = currentAnswer.length < 5;
	const showLetterPlaceHolder =
		currentAnswer.length < 1 && attempts < 6 && !gameCompleted;

	return (
		<div className="container">
			<div className="gameLayer" style={{ position: "relative" }}>
				<div className="currentWordHint">
					{usedWords[usedWords.length - 1]?.toUpperCase()}
				</div>
				<div className="title">fWORDLE</div>
				{gameCompleted && <div className="status">🎉 You won! 🎉</div>}
				{attempts >= 6 && (
					<div className="status">Sorry. No more attempts.</div>
				)}
				<div className="wordGrid">
					{answers.map((answer, wordIndex) => (
						<div className="word">
							{answer
								.toUpperCase()
								.split("")
								.map((char, charIndex) => {
									const colorClass = getLetterBoxColorClass(
										answer,
										char.toLowerCase(),
										charIndex,
									);

									return (
										<div
											key={`ans_${wordIndex}_${char}_${charIndex}`}
											className={`letterBox ${colorClass}`}
										>
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
									<div
										key={index}
										className="letterBox"
										style={{ color: "lightblue" }}
									>
										{currentAnswerLetters[index]
											? currentAnswerLetters[index].toUpperCase()
											: ""}
									</div>
								))}
						</div>
					)}
				</div>
				<div className="controlBar">
					<button
						type="button"
						className="controlBarButton"
						onClick={resetGameHandler}
					>
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
