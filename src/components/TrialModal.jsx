export default function TrialModal({ daysLeft, onDismiss }) {
  const isUrgent = daysLeft <= 2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">{isUrgent ? "⏰" : "💪"}</div>
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          {isUrgent
            ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your trial`
            : "7 days down — you're building a habit"}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {isUrgent
            ? "Keep your streak going — upgrade to stay on track."
            : "Most men see a real difference in 2 weeks. You're halfway there."}
        </p>
        <button
          onClick={onDismiss}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {isUrgent ? "Keep Going →" : "Got it, keep tracking →"}
        </button>
      </div>
    </div>
  );
}