const TARGET_KEY = "snap.dailyTarget";
const AWARENESS_KEY = "snap.awarenessGuess"; // optional: if you saved their earlier guess

export default function Results() {
  const target = Number(localStorage.getItem(TARGET_KEY)) || 105;
  const perMeal = Math.round(target / 4);
  const guess = localStorage.getItem(AWARENESS_KEY);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-xl px-4">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <h2 className="text-center text-slate-700 font-semibold">Your daily protein goal</h2>

          <div className="mt-2 text-center">
            <div className="text-6xl font-extrabold text-slate-900">
              {target}<span className="text-slate-900">g</span>
            </div>
            <p className="mt-2 text-slate-600">
              That’s about <span className="font-semibold">{perMeal}g</span> per meal (4 meals/snacks).
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-slate-500">
            {guess
              ? <>Earlier you estimated <span className="font-semibold">{guess}</span> — your actual need is <span className="font-semibold">{target}g</span>.</>
              : <>Most people underestimate their daily protein needs — here’s the science behind this target.</>}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Why higher than the old RDA?</h3>
            <ul className="mt-2 leading-relaxed space-y-2 text-slate-700">
              <li><span className="font-semibold">RDA = 0.8 g/kg</span> (set to prevent deficiency in young adults)</li>
              <li><span className="font-semibold">After ~40</span>: anabolic resistance reduces efficiency</li>
              <li><span className="font-semibold">Better target ≈ 1.2 g/kg/day</span> to maintain strength &amp; muscle</li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">(Journal of Gerontology, 2013)</p>
          </div>

          <p className="mt-6 text-slate-700">
            This higher target helps maintain <span className="font-semibold">muscle mass</span> and supports
            <span className="font-semibold"> metabolic health</span> as you age.
          </p>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="h-12 px-4 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              Back
            </button>

            <a
              href="#home"
              className="h-12 px-5 rounded-2xl bg-blue-600 text-white font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 grid place-items-center"
            >
              Start tracking my protein →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
