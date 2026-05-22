import { useEffect, useState } from "react";
import Home from "./screens/Home.jsx";
import Results from "./screens/Results.jsx";
import ProteinLookup from "./screens/ProteinLookup.jsx";
import EmailGate from "./screens/EmailGate.jsx";
import TrialModal from "./components/TrialModal.jsx";

const TRIAL_DAYS = 14;
const ANNUAL_PRICE_ID = "price_1TZgGGKTZAkGckxSjprtDoXq";
const LIFETIME_PRICE_ID = "price_1TZgHZKTZAkGckxSpOtgHSYe";

function getTrialStatus() {
  if (localStorage.getItem("sp_paid") === "true") {
    return { gated: false, expired: false, paid: true, daysLeft: 999 };
  }
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
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("paid") === "true") {
      localStorage.setItem("sp_paid", "true");
      window.history.replaceState({}, "", "/");
      setTrialStatus(getTrialStatus());
    }
  }, []);

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

  const handleUpgrade = async (priceId, planName) => {
    setUpgrading(planName);
    try {
      const email = localStorage.getItem("sp_user_email") || "";
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      setUpgrading(null);
    }
  };

  if (trialStatus.gated) {
    return <EmailGate onSuccess={() => setTrialStatus(getTrialStatus())} />;
  }

  if (trialStatus.expired) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">⏰</div>
            <h2 className="text-2xl font-bold text-white mb-2">Your trial has ended</h2>
            <p className="text-slate-400 text-sm">Keep your streak going. Choose a plan below.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#242424] border border-slate-700 rounded-2xl p-5 flex flex-col">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Annual</div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$59</span>
                <span className="text-slate-400 text-sm">/yr</span>
              </div>
              <ul className="text-slate-300 text-xs space-y-2 mb-6 flex-1">
                <li>✓ Full app, no restrictions</li>
                <li>✓ Progress ring + shortcuts</li>
                <li>✓ Streak tracking</li>
                <li>✓ Cancel anytime</li>
              </ul>
              <button
                onClick={() => handleUpgrade(ANNUAL_PRICE_ID, "annual")}
                disabled={upgrading !== null}
                className="w-full border border-slate-500 text-slate-300 hover:border-white hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {upgrading === "annual" ? "Loading…" : "Choose Annual"}
              </button>
            </div>
            <div className="bg-[#1e3d2f] border border-[#4d8c5a] rounded-2xl p-5 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#4d8c5a] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  BEST VALUE
                </span>
              </div>
              <div className="text-xs font-semibold text-[#7bc47f] uppercase tracking-wider mb-3 mt-1">Lifetime</div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$79</span>
                <span className="text-slate-400 text-sm"> once</span>
              </div>
              <ul className="text-slate-300 text-xs space-y-2 mb-6 flex-1">
                <li>✓ Everything in Annual</li>
                <li>✓ Price locked forever</li>
                <li>✓ All future updates</li>
                <li>✓ No renewals ever</li>
              </ul>
              <button
                onClick={() => handleUpgrade(LIFETIME_PRICE_ID, "lifetime")}
                disabled={upgrading !== null}
                className="w-full bg-[#4d8c5a] hover:bg-[#3d7a4a] text-white font-bold py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {upgrading === "lifetime" ? "Loading…" : "Get Lifetime Access"}
              </button>
            </div>
          </div>
          <p className="text-center text-slate-500 text-xs mt-6">
            Founders pricing ends at 100 members · After that: $99
          </p>
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