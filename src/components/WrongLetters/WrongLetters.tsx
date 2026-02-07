import BlockedLetters from "../BlockedLetters";

const WrongLetters: React.FC<{ show: boolean; incorrectLetters: string[] }> = ({ show, incorrectLetters }) => {
  if (!show) return null;
  return (
    <BlockedLetters
      charLength={incorrectLetters.length}
      letters={[...incorrectLetters].join("")}
      letterContainerStyles="wrongLetters"
      letterStyles="wrongLetterBox"
    />
  );
};

export default WrongLetters;
