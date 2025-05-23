import "./App.css";

import ThemeProvider from "./theme";

import ThemeColorPresets from "./components/ThemeColorPresets";

import Router from "./routes";

function App() {
  return (
    <ThemeProvider>
      <ThemeColorPresets>
        <Router />
      </ThemeColorPresets>
    </ThemeProvider>
  );
}

export default App;
