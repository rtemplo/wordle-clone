import BlockedLetters from "../BlockedLetters";

const AnswerEntry: React.FC<{ show: boolean; currentAnswer: string }> = ({ show, currentAnswer }) => {
  if (!show) return null;
  return (
    <BlockedLetters
      charLength={5}
      letters={currentAnswer}
      letterContainerStyles="answer"
      letterStyles="answerLetterBox blueLetters"
    />
  );
};

export default AnswerEntry;
