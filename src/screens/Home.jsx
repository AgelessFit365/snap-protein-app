import { useEffect, useMemo, useState } from "react";
import { getStorage } from "../state/storage";
import { updateStreakOnFirstLog, todayISO, isoYesterday } from "../utils/calc";
import ShortcutEditor from "../components/ShortcutEditor.jsx";

// lightweight id generator
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const DEFAULT_TARGET = 105;
const DEFAULT_SHORTCUTS = [
  { name: "Chicken", grams: 30 },
  { name: "Greek yogurt", grams: 20 },
  { name: "Whey shake", grams: 25 },
  { name: "Custom", grams: 0 },
];

export default function Home() {
  const storage = useMemo(() => getStorage(), []);
  const [loading, setLoading] = useState(true);

  // prefs
  const [dailyTarget, setDailyTarget] = useState(DEFAULT_TARGET);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [streak, setStreak] = useState(0);
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS);

  // logs for today
  const [logs, setLogs] = useState([]);
  const [custom, setCustom] = useState("");

  // toast + tour
  const [toast, setToast] = useState("");
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // shortcut editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);
  const [editingInitial, setEditingInitial] = useState({ name: "", grams: 0 });

  const total = logs.reduce((sum, l) => sum + (Number(l?.grams) || 0), 0);
  const remaining = Math.max(dailyTarget - total, 0);
  const pct = Math.min(Math.round((total / Math.max(dailyTarget, 1)) * 100), 100);

  // init: load prefs + today's logs
  useEffect(() => {
    (async () => {
      try {
        const prefs = await storage.getPrefs();
        const target = Number(prefs?.dailyTargetGrams) || DEFAULT_TARGET;

        setDailyTarget(target);
        setTargetInput(String(target));
        setStreak(Number(prefs?.streakCount || 0));
        setShortcuts(
          Array.isArray(prefs?.shortcuts) && prefs.shortcuts.length === 4
            ? prefs.shortcuts
            : DEFAULT_SHORTCUTS
        );

        const logsToday = await storage.getLogsByDate(todayISO());
        setLogs(Array.isArray(logsToday) ? logsToday : []);

        // show tour only if first time
        if (!prefs?.hasSeenTour) {
          setShowTour(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [storage]);

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // reliable order: read prefs -> compute streak -> write log -> save prefs
  async function addProtein(grams, source = "Quick Add") {
    const g = Number(grams);
    if (!g || g <= 0) return;

    // milestones before changing state
    const before = total;
    const after = before + g;
    const fracBefore = before / Math.max(dailyTarget, 1);
    const fracAfter = after / Math.max(dailyTarget, 1);

    // 1) read prefs first
    const prevPrefs = await storage.getPrefs();

    // 2) compute potential streak update
    const nextPrefs = updateStreakOnFirstLog(prevPrefs || {});

    // 3) persist the log
    const log = {
      id: uid(),
      dateISO: todayISO(),
      grams: g,
      source,
      note: "",
      updatedAt: new Date().toISOString(),
    };

    await storage.addLog(log);
    setLogs((prev) => [...prev, log]);

    // 4) persist prefs and update badge
    await storage.setPrefs(nextPrefs);
    const prevStreak = Number(prevPrefs?.streakCount || 0);
    const nextStreak = Number(nextPrefs?.streakCount || 0);
    setStreak(nextStreak);

    if (nextStreak > prevStreak) {
      flashToast("Streak +1! Keep it going 🔥");
    }

    // 5) progress milestone toasts
    if (fracBefore < 0.8 && fracAfter >= 0.8 && fracAfter < 1) {
      flashToast("Nice — 80% of today’s target!");
    }
    if (fracBefore < 1 && fracAfter >= 1) {
      flashToast("Target hit! 🎯");
    }

    setCustom("");
  }

  async function handleCustomAdd() {
    await addProtein(Number(custom || 0), "Custom");
  }

  async function handleUndo() {
    const last = logs[logs.length - 1];
    if (!last) return;
    await storage.deleteLog(last.id);
    setLogs((prev) => prev.slice(0, -1));
  }

  async function handleTargetSave() {
    const num = Number(targetInput);
    const target = !isNaN(num) && num > 0 ? Math.round(num) : DEFAULT_TARGET;
    setDailyTarget(target);
    setTargetInput(String(target));

    const prefs = await storage.getPrefs();
    await storage.setPrefs({
      ...prefs,
      dailyTargetGrams: target,
      updatedAt: new Date().toISOString(),
    });
  }

  // ---------- Shortcuts: edit/save ----------
  function openEditor(index) {
    setEditingIndex(index);
    setEditingInitial(shortcuts[index] || { name: "", grams: 0 });
    setEditorOpen(true);
  }

  async function saveShortcut(updated) {
    const next = shortcuts.map((s, i) => (i === editingIndex ? updated : s));
    setShortcuts(next);

    const prefs = await storage.getPrefs();
    await storage.setPrefs({
      ...prefs,
      shortcuts: next,
      updatedAt: new Date().toISOString(),
    });

    setEditorOpen(false);
  }
    async function resetShortcut() {
    const resetTo = DEFAULT_SHORTCUTS[editingIndex];
    const next = shortcuts.map((s, i) => (i === editingIndex ? resetTo : s));
    setShortcuts(next);

    const prefs = await storage.getPrefs();
    await storage.setPrefs({
      ...prefs,
      shortcuts: next,
      updatedAt: new Date().toISOString(),
    });

    setEditorOpen(false);
  }

  async function closeTourAndSaveSeen() {
    const prefs = await storage.getPrefs();
    await storage.setPrefs({
      ...prefs,
      hasSeenTour: true,
      updatedAt: new Date().toISOString(),
    });
    setShowTour(false);
    setTourStep(0);
  }

  async function handleSkipTour() {
    await closeTourAndSaveSeen();
  }

  async function handleFinishTour() {
    await closeTourAndSaveSeen();
  }

  // DEV: simulate "new day" — move today's logs to yesterday + prep streak
  async function simulateNewDay() {
    if (!import.meta.env.DEV) return;

    const today = todayISO();
    const ymd = isoYesterday(); // consistent local date

    // move today's logs to yesterday (so ring resets)
    const todays = await storage.getLogsByDate(today);
    for (const l of todays) {
      await storage.deleteLog(l.id);
      await storage.addLog({
        ...l,
        id: uid(),
        dateISO: ymd,
        updatedAt: new Date().toISOString(),
      });
    }

    // set last log date to yesterday; keep current streak count
    const prefs = await storage.getPrefs();
    await storage.setPrefs({
      ...prefs,
      streakLastDateISO: ymd,
      updatedAt: new Date().toISOString(),
    });

    // refresh UI
    setLogs([]);
    setStreak(Number(prefs?.streakCount || 0));
    flashToast("Dev: rolled to new day ✔️");
  }

  // pick color based on progress
  const progressColor = pct >= 100 ? "#15803d" : "#2563eb";
  // blue until 100%, then hunter green

  const ringStyle = {
    background: `conic-gradient(${progressColor} ${pct * 3.6}deg, #e5e7eb 0deg)`,
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-900">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        {/* Header row with streak badge */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">SnapProtein</h1>
            <p className="text-slate-500 mt-1">Quick-add your protein and watch the ring fill.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Streak</span>
            <span className="inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-full bg-blue-600 text-white text-sm font-bold">
              {streak}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mt-6 p-6 sm:p-8">
          {/* Ring + totals */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full grid place-items-center" style={ringStyle}>
              <div className="w-32 h-32 bg-white rounded-full grid place-items-center border border-slate-200">
                <div className="text-center">
                  <div className="text-3xl font-extrabold">{total}g</div>
                  <div className="text-xs text-slate-500 mt-1">completed of {dailyTarget}g</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm mt-3">
  <span className="font-semibold">{remaining}g</span> left today • {pct}% complete
</div>
          </div>

          {/* Quick add */}
          <div className="mt-6">
            <div className="font-semibold mb-2">Quick add</div>
            <div className="grid grid-cols-3 gap-3">
              <button
                className="h-12 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:opacity-95"
                onClick={() => addProtein(20)}
              >
                +20g
              </button>
              <button
                className="h-12 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:opacity-95"
                onClick={() => addProtein(25)}
              >
                +25g
              </button>
              <button
                className="h-12 rounded-xl bg-blue-600 text-white font-semibold shadow-sm hover:opacity-95"
                onClick={() => addProtein(30)}
              >
                +30g
              </button>
            </div>

            {/* Custom input */}
            <div className="mt-3 flex gap-3">
              <input
                type="number"
                placeholder="Custom (g)"
                className="flex-1 h-12 px-4 rounded-xl border border-slate-300 outline-none"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
              <button
                className="h-12 px-5 rounded-xl bg-slate-900 text-white font-semibold shadow-sm hover:opacity-95"
                onClick={handleCustomAdd}
              >
                Add
              </button>
            </div>
          </div>

          {/* Shortcuts (editable) */}
          <div className="mt-6">
            <div className="font-semibold mb-2">Food shortcuts</div>

            {/* 2×2 grid, large tap targets */}
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((s, i) => (
                <div key={i} className="relative">
                  <button
                    className="w-full h-16 rounded-xl border border-slate-300 hover:bg-slate-50 text-left px-4"
                    onClick={() => addProtein(s.grams, s.name)}
                    title={`${s.name} • ${s.grams}g`}
                  >
                    <div className="font-semibold">{s.name || "Shortcut"}</div>
                    <div className="text-xs text-slate-500">{Number(s.grams) || 0}g</div>
                  </button>

                  {/* tiny pencil in top-right */}
                  <button
                    aria-label="Edit shortcut"
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                    onClick={() => openEditor(i)}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Today table + target + undo */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Today</div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">Target</span>
                <input
                  type="number"
                  className="w-16 h-9 text-center rounded-lg border border-slate-300"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  onBlur={handleTargetSave}
                />
                <button
                  onClick={handleUndo}
                  className="h-9 px-3 rounded-lg border border-slate-300 hover:bg-slate-50"
                >
                  Undo
                </button>
                {/*
                {import.meta.env.DEV && (
                  <button
                    onClick={simulateNewDay}
                    className="h-9 px-3 rounded-lg border border-slate-300 hover:bg-slate-50"
                    title="Dev only: roll today's logs to yesterday; next add will increment streak"
                  >
                    Dev: Simulate new day
                  </button>
                )}
                  */}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              {logs.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  No entries yet — try a quick-add or a food shortcut.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id} className="border-b border-slate-100 last:border-0">
                        <td className="p-3">{l.source || "Protein"}</td>
                        <td className="p-3 text-right font-semibold">{l.grams}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <p className="text-center text-slate-600 text-sm mt-6">
            Need a quick reference?{" "}
            <a href="#lookup" className="text-blue-600 hover:underline">
              Protein Lookup
            </a>
          </p>

          <div className="text-center text-slate-400 text-xs mt-4">
            Tip: hit 27g per meal to stay on pace.
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50">
          <div className="px-4 py-2 rounded-xl bg-slate-900 text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

      {/* Shortcut editor modal */}
      <ShortcutEditor
        open={editorOpen}
        initial={editingInitial}
        onSave={saveShortcut}
        onReset={resetShortcut}
        onClose={() => setEditorOpen(false)}
        title="Edit Shortcut"
      />

      {/* First-time tour */}
      {showTour && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-xl">
            {tourStep === 0 && (
              <>
                <h2 className="text-xl font-bold mb-2">Welcome to SnapProtein</h2>
                <p className="text-slate-600">
                  Log your protein with one tap. The ring fills toward your daily target.
                </p>
              </>
            )}
            {tourStep === 1 && (
              <>
                <h2 className="text-xl font-bold mb-2">Streaks = habit, not goal %</h2>
                <p className="text-slate-600">
                  Your streak increases on the first log of each new day. Keep the chain going.
                </p>
              </>
            )}
            {tourStep === 2 && (
              <>
                <h2 className="text-xl font-bold mb-2">Quick add & shortcuts</h2>
                <p className="text-slate-600">
                  Use +20g/+25g/+30g or your own shortcuts. Tap ✎ to customize.
                </p>
              </>
            )}
            {tourStep === 3 && (
              <>
                <h2 className="text-xl font-bold mb-2">Target & Undo</h2>
                <p className="text-slate-600">
                  Edit your daily target any time. Made a mistake? Hit Undo to remove the last entry.
                </p>
              </>
            )}

            <div className="mt-6 flex justify-between gap-2">
              <button
                className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
                onClick={handleSkipTour}
              >
                Skip tour
              </button>

              <div className="flex gap-2">
                {tourStep > 0 && (
                  <button
                    className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
                    onClick={() => setTourStep((s) => s - 1)}
                  >
                    Back
                  </button>
                )}

                {tourStep < 3 ? (
                  <button
                    className="h-10 px-4 rounded-lg bg-blue-600 text-white hover:opacity-95"
                    onClick={() => setTourStep((s) => s + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="h-10 px-4 rounded-lg bg-slate-900 text-white hover:opacity-95"
                    onClick={handleFinishTour}
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 grid place-items-center pointer-events-none">
          <div className="bg-black/5 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
            Loading…
          </div>
        </div>
      )}
    </div>
  );
}