// src/App.jsx
import { useEffect, useState } from "react";
import Home from "./screens/Home.jsx";
import Results from "./screens/Results.jsx";
import ProteinLookup from "./screens/ProteinLookup.jsx";

export default function App() {
  // read '#something' or default to 'home'
  const getView = () => (location.hash.replace("#", "") || "home");
  const [view, setView] = useState(getView());

  useEffect(() => {
    const onHash = () => setView(getView());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // simple router
  if (view === "results") return <Results />;
  if (view === "lookup")  return <ProteinLookup />;
  return <Home />;
}
