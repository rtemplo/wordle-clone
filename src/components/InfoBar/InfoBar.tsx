import "./InfoBar.css";

const InfoBar: React.FC<{
  show: boolean;
  wordToSolve: string;
  wordSolved: boolean;
  noMoreAttempts: boolean;
  getDefinition: () => void;
}> = ({ show, wordToSolve, wordSolved, noMoreAttempts, getDefinition }) => {
  if (!show) return null;
  return (
    <>
      {wordSolved && <div className="status">🎉 You won! 🎉</div>}
      <div className="showDefinition">
        <button type="button" className="showDefinitionButton" onClick={getDefinition}>
          {wordToSolve.toUpperCase()}
        </button>
      </div>
      {noMoreAttempts && <div className="status">Sorry. No more attempts.</div>}
    </>
  );
};

export default InfoBar;
