import { useState, useEffect } from "react";
import dataset from "./data/dataset.json";
import { Dashboard } from "./components/Dashboard";
import type { Dataset } from "./data/types";

const data = dataset as Dataset;

function App() {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      /* noop */
    }
  }, [dark]);

  const toggleTheme = () => setDark((p) => !p);

  return <Dashboard data={data} dark={dark} toggleTheme={toggleTheme} />;
}

export default App;
