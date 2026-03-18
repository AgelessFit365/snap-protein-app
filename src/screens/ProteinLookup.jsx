// src/screens/ProteinLookup.jsx
import React from "react";

const FOODS = [
  { name: "Chicken breast (3 oz cooked)", grams: 26 },
  { name: "Ground beef 90% lean (3 oz cooked)", grams: 22 },
  { name: "Turkey breast (3 oz cooked)", grams: 25 },
  { name: "Pork loin (3 oz cooked)", grams: 22 },
  { name: "Salmon (3 oz cooked)", grams: 21 },
  { name: "Tuna (3 oz canned, drained)", grams: 20 },
  { name: "Shrimp (3 oz cooked)", grams: 18 },
  { name: "Egg, large (1)", grams: 6 },
  { name: "Egg whites (3)", grams: 11 },
  { name: "Greek yogurt (3/4 cup / 170g)", grams: 17 },
  { name: "Cottage cheese (1/2 cup)", grams: 14 },
  { name: "Whey protein scoop (1)", grams: 24 },
  { name: "Milk 2% (1 cup)", grams: 8 },
  { name: "Tofu, firm (3 oz / 85g)", grams: 9 },
  { name: "Tempeh (3 oz / 85g)", grams: 15 },
  { name: "Edamame (1/2 cup)", grams: 9 },
  { name: "Lentils, cooked (1/2 cup)", grams: 9 },
  { name: "Black beans, cooked (1/2 cup)", grams: 7 },
  { name: "Peanut butter (2 Tbsp)", grams: 7 },
  { name: "Protein bar (typical)", grams: 20 },
  { name: "Cheddar cheese (1 oz)", grams: 7 },
  { name: "Ham, lean (3 oz)", grams: 18 },
  { name: "Turkey deli, lean (3 oz)", grams: 18 },
];

export default function ProteinLookup() {
  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-900">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Protein Lookup</h1>
          {/* Works with your hash-nav setup */}
          <a href="#" className="text-sm text-blue-600 hover:underline">← Back</a>
        </div>
        <p className="text-slate-600 mb-4">
          Quick reference for common foods. Use this to set up your shortcuts.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {FOODS.map((f, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="p-3">{f.name}</td>
                  <td className="p-3 text-right font-semibold">{f.grams}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Tip: If your serving is different, adjust mentally (e.g., 2 eggs ≈ 12g).
        </p>
      </div>
    </div>
  );
}
