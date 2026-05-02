import { useState } from "react";

export default function EmailGate({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
     await fetch("/api/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    name,
    groupId: import.meta.env.VITE_MAILERLITE_GROUP_ID,
  }),
});

      localStorage.setItem("sp_gate_passed", "true");
      localStorage.setItem("sp_trial_start", Date.now().toString());
      onSuccess();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">SP</div>
            <span className="text-2xl font-bold text-slate-800">SnapProtein</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Start Your Free 14-Day Trial</h1>
          <p className="text-slate-500 text-sm">Hit your protein target every day. No calorie counting. No database. Just your number.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            required
          />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg"
          >
            {loading ? "Starting trial..." : "Start Free Trial →"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-green-500">✓</span>
            <span>14 days free — no credit card needed</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-green-500">✓</span>
            <span>No calorie counting or macro tracking</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-green-500">✓</span>
            <span>Built for men over 40</span>
          </div>
        </div>
      </div>
    </div>
  );
}