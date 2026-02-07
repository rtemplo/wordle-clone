import BlockedLetters from "../BlockedLetters";
import "./Logo.css";

const Logo: React.FC = () => (
  <div className="logoContainer">
    <BlockedLetters charLength={6} letters="WORDLE" letterContainerStyles="logo1" letterStyles="logoLetterBox1" />
    <BlockedLetters charLength={5} letters="CLONE" letterContainerStyles="logo2" letterStyles="logoLetterBox2" />
  </div>
);

export default Logo;
