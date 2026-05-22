import { FallingLeaves } from "./FallingLeaves";
import "./index.css";

export function App() {
  return (
    <div className="landing-container">
      <FallingLeaves />
      <div className="center-content">
        <h1 className="aoi-text">AOI</h1>
        <p className="type-any-key">Type any key</p>
      </div>
    </div>
  );
}

export default App;
