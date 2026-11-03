import { useSearchParams } from "react-router-dom";
import { useResultsStatus } from "../hooks/useResultsStatus.js";
import GlitchLoader from "../components/GlitchLoader.jsx";
import ResultsView from "../components/ResultsView.jsx";

export default function Results() {
  const { resultsPublished } = useResultsStatus();
  const [searchParams] = useSearchParams();

  // Allow admin direct preview via query param if needed
  const forceView = searchParams.get("view"); // 'results' | 'glitch'

  const showResults =
    forceView === "results"
      ? true
      : forceView === "glitch"
      ? false
      : resultsPublished;

  if (showResults) {
    return <ResultsView />;
  }

  return <GlitchLoader />;
}
