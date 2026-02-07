import "./WordReveal.css";

const WordReveal: React.FC<{ show: boolean; word: string }> = ({ show, word }) => {
  if (!show) return null;
  return <div className="wordReveal">{word.toUpperCase()}</div>;
};

export default WordReveal;
