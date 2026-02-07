import { useCallback } from "react";
import type { WordMatchMap } from "../../types";
import BlockedLetters from "../BlockedLetters";

const ListAnswers: React.FC<{
  answers: string[];
  wordMatchMaps: WordMatchMap;
}> = ({ answers, wordMatchMaps }) => {
  const getLetterBoxColorClass = useCallback(
    (answer: string, char: string, index: number): string => {
      if (!answer || !char) return "";

      // Get map of character matches for the answer.
      const charPosMap = wordMatchMaps[answer] ? wordMatchMaps[answer][char] : undefined;

      // Only attempt to color if letter is in the word.
      if (charPosMap) {
        // Letter is in the correct position.
        const isInCorrectPosition = Boolean(charPosMap[index]);
        if (isInCorrectPosition) return "correctPosition";

        // Letter is in the word but at another position AND that position is not already matched by the same letter.
        const openPositionsInWord = Object.values(charPosMap).some((position) => position === false);
        if (openPositionsInWord) return "incorrectPosition";
      }

      // Letter not in word.
      return "";
    },
    [wordMatchMaps],
  );

  return (
    <>
      {answers.map((answer, wordIndex) => (
        <BlockedLetters
          key={`${answer}_${wordIndex}`}
          charLength={answer.length}
          letters={answer}
          letterContainerStyles="answer"
          letterStyles="answerLetterBox"
          styleModifier={(char, charIndex) => getLetterBoxColorClass(answer, char, charIndex)}
        />
      ))}
    </>
  );
};

export default ListAnswers;
