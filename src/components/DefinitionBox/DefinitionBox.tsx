import { IoMdCloseCircleOutline } from "react-icons/io";
import type { DictionaryEntry } from "../../types";
import "./DefinitionBox.css";

interface DefinitionBoxProps {
  show: boolean;
  entry?: DictionaryEntry;
  word: string;
  onClose: () => void;
}

const DefinitionBox: React.FC<DefinitionBoxProps> = ({ show = false, entry, word, onClose }) => {
  if (!show || !entry) return null;
  return (
    <div className="definitionBox">
      <div className="definitionHeader">
        <div>{word.toUpperCase()}</div>
        <button type="button" className="definitionCloseButton" onClick={onClose}>
          <IoMdCloseCircleOutline aria-hidden="true" focusable="false" />
        </button>
      </div>
      {entry?.meanings.length === 0 && <p>No definition found.</p>}
      {entry?.meanings.map((meaning, meaningIndex) => (
        <div key={`meaning_${meaningIndex}`}>
          <strong>{meaning.partOfSpeech}</strong>
          <ul>
            {meaning.definitions.map((def, defIndex) => (
              <li key={`def_${defIndex}`}>
                {def.definition}
                {def.example && <em> (e.g., {def.example})</em>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DefinitionBox;
