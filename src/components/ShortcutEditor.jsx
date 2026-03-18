// src/components/ShortcutEditor.jsx
import React, { useEffect, useState } from "react";

export default function ShortcutEditor({
  open,
  initial = { name: "", grams: 0 },
  onSave,
  onReset,
  onClose,
  title = "Edit Shortcut",
}) {
  const [name, setName] = useState(initial.name || "");
  const [grams, setGrams] = useState(String(initial.grams || ""));

  useEffect(() => {
    if (open) {
      setName(initial.name || "");
      setGrams(String(initial.grams ?? ""));
    }
  }, [open, initial]);

  if (!open) return null;

  const valid = name.trim().length > 0 && Number(grams) > 0;

  function handleSave() {
    if (!valid) return;
    onSave?.({ name: name.trim(), grams: Math.round(Number(grams)) });
  }

  function handleReset() {
    onReset?.();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-2">{title}</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600 mb-1">Name</label>
            <input
              className="w-full h-11 px-3 rounded-lg border border-slate-300 outline-none"
              placeholder="e.g., Eggs"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Default grams</label>
            <input
              type="number"
              className="w-full h-11 px-3 rounded-lg border border-slate-300 outline-none"
              placeholder="e.g., 18"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          <button
            className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
            onClick={handleReset}
          >
            Reset slot
          </button>

          <div className="flex gap-2">
            <button
              className="h-10 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className={`h-10 px-4 rounded-lg text-white ${
                valid ? "bg-blue-600 hover:opacity-95" : "bg-slate-400 cursor-not-allowed"
              }`}
              onClick={handleSave}
              disabled={!valid}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}