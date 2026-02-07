import type React from "react";
import "./BlockedLetters.css";

type StyleModifierFunction = (char: string, index: number) => string;

interface BlockedLettersProps {
  charLength: number;
  letters?: string;
  letterContainerStyles?: string;
  letterStyles?: string;
  styleModifier?: StyleModifierFunction;
}

const BlockedLetters: React.FC<BlockedLettersProps> = ({
  charLength,
  letters,
  letterContainerStyles = "",
  letterStyles = "",
  styleModifier,
}) => {
  return (
    <div className={letterContainerStyles}>
      {Array.from({ length: charLength }, (_, index) => {
        const char = letters?.[index] ?? "";
        const computedClass = styleModifier ? styleModifier(char.toLowerCase(), index) : "";
        const classNames = `letterBox ${letterStyles} ${computedClass}`;

        return (
          <div key={`${letters}_${index}`} className={classNames}>
            {char ? char.toUpperCase() : ""}
          </div>
        );
      })}
    </div>
  );
};

export default BlockedLetters;
