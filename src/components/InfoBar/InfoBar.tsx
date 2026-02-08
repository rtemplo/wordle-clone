import "./InfoBar.css";

const InfoBar: React.FC<{
  show: boolean;
  wordToSolve: string;
  wordSolved: boolean;
  noMoreAttempts: boolean;
  showDefinition: (show: boolean) => void;
}> = ({ show, wordToSolve, wordSolved, noMoreAttempts, showDefinition }) => {
  if (!show) return null;
  return (
    <>
      {wordSolved && <div className="status">🎉 You won! 🎉</div>}
      <div className="showDefinition">
        <button type="button" className="showDefinitionButton" onClick={() => showDefinition(true)}>
          {wordToSolve.toUpperCase()}
        </button>
      </div>
      {noMoreAttempts && <div className="status">Sorry. No more attempts.</div>}
    </>
  );
};

export default InfoBar;
