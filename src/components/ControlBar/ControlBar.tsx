import "./ControlBar.css";

const ControlBar: React.FC<{
  gameFinished: boolean;
  wordEntryIncomplete: boolean;
  resetGameHandler: () => void;
  submitWord: () => void;
}> = ({ gameFinished, wordEntryIncomplete, resetGameHandler, submitWord }) => {
  return (
    <div className="controlBar">
      <button type="button" className="controlBarButton" onClick={resetGameHandler}>
        New Game
      </button>
      {!gameFinished && (
        <button
          type="button"
          className={`controlBarButton ${wordEntryIncomplete ? "disabledButton" : ""}`}
          onClick={submitWord}
          disabled={wordEntryIncomplete}
        >
          Submit Word
        </button>
      )}
    </div>
  );
};

export default ControlBar;
