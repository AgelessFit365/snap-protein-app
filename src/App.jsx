import { useEffect, useState } from "react";
import Home from "./screens/Home.jsx";
import Results from "./screens/Results.jsx";
import ProteinLookup from "./screens/ProteinLookup.jsx";
import EmailGate from "./screens/EmailGate.jsx";
import TrialModal from "./components/TrialModal.jsx";

const TRIAL_DAYS = 14;

function getTrialStatus() {
  const passed = localStorage.getItem("sp_gate_passed");
  const start = localStorage.getItem("sp_trial_start");
  if (!passed || !start) return { gated: true, daysLeft: TRIAL_DAYS };

  const elapsed = Date.now() - parseInt(start);
  const daysElapsed = elapsed / (1000 * 60 * 60 * 24);
  const daysLeft = Math.ceil(TRIAL_DAYS - daysElapsed);

  if (daysLeft <= 0) return { gated: false, expired: true, daysLeft: 0 };
  return { gated: false, expired: false, daysLeft };
}

export default function App() {
  const getView = () => (location.hash.replace("#", "") || "home");
  const [view, setView] = useState(getView());
  const [trialStatus, setTrialStatus] = useState(getTrialStatus());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const onHash = () => setView(getView());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (trialStatus.gated || trialStatus.expired) return;

    const daysElapsed = TRIAL_DAYS - trialStatus.daysLeft;
    const modal7shown = localStorage.getItem("sp_modal_7_shown");
    const modal13shown = localStorage.getItem("sp_modal_13_shown");

    if (daysElapsed >= 7 && daysElapsed < 8 && !modal7shown) {
      setShowModal(true);
      localStorage.setItem("sp_modal_7_shown", "true");
    } else if (daysElapsed >= 13 && !modal13shown) {
      setShowModal(true);
      localStorage.setItem("sp_modal_13_shown", "true");
    }
  }, [trialStatus]);

  if (trialStatus.gated) {
    return <EmailGate onSuccess={() => setTrialStatus(getTrialStatus())} />;
  }

  if (trialStatus.expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-slate-800 mb-3">Your trial has ended</h2>
          <p className="text-slate-500 text-sm mb-6">Upgrade to keep your streak going and hit your protein target every day.</p>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors text-lg">
            Upgrade Now →
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <TrialModal
          daysLeft={trialStatus.daysLeft}
          onDismiss={() => setShowModal(false)}
        />
      )}
      {view === "results" && <Results />}
      {view === "lookup" && <ProteinLookup />}
      {view !== "results" && view !== "lookup" && <Home />}
    </>
  );
}