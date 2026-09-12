"use client";

import { useState } from "react";
import { UserPreferences, Category, FashionVibe, Brand } from "@/types/fashion";
import { Sparkles, DollarSign, Shirt, Compass, Check } from "lucide-react";

interface StyleQuizProps {
  initialPreferences?: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onProceedToMirror?: () => void;
}

export default function StyleQuiz({
  initialPreferences,
  onPreferencesChange,
  onProceedToMirror,
}: StyleQuizProps) {
  const [budget, setBudget] = useState<number>(initialPreferences?.budget ?? 150);
  const [category, setCategory] = useState<Category>(initialPreferences?.category ?? "top");
  const [vibe, setVibe] = useState<FashionVibe>(initialPreferences?.vibe ?? "party");
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>(
    initialPreferences?.preferredBrands ?? ["Zara", "Calvin Klein", "Boss"]
  );

  const handleUpdate = (
    newBudget: number,
    newCategory: Category,
    newVibe: FashionVibe,
    newBrands: Brand[]
  ) => {
    onPreferencesChange({
      budget: newBudget,
      category: newCategory,
      vibe: newVibe,
      preferredBrands: newBrands,
    });
  };

  const toggleBrand = (brand: Brand) => {
    let next: Brand[];
    if (selectedBrands.includes(brand)) {
      if (selectedBrands.length === 1) return; // keep at least one
      next = selectedBrands.filter((b) => b !== brand);
    } else {
      next = [...selectedBrands, brand];
    }
    setSelectedBrands(next);
    handleUpdate(budget, category, vibe, next);
  };

  const categories: { id: Category; label: string; desc: string; icon: string }[] = [
    { id: "top", label: "Tops & Blazers", desc: "Shirts, Knits, Satin Blouses", icon: "👕" },
    { id: "trouser", label: "Trousers & Pants", desc: "Tailored, Linen, Selvedge Denim", icon: "👖" },
    { id: "full-look", label: "Complete Ensemble", desc: "Top + Bottom Coordinated Look", icon: "✨" },
  ];

  const vibes: { id: FashionVibe; label: string; desc: string; emoji: string }[] = [
    { id: "comfy", label: "Comfy & Minimal", desc: "French terry, Supima cotton, relaxed fits", emoji: "☕" },
    { id: "beach", label: "Beach & Resort", desc: "Italian linen, open crochet, camp collars", emoji: "🏖️" },
    { id: "party", label: "Party & Night Out", desc: "Satin sheen, sharp blazers, statement drape", emoji: "🍸" },
    { id: "formal", label: "Runway & Tailored", desc: "Virgin wool, structured cuts, stealth luxury", emoji: "👔" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute -right-24 -top-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: Your Style Profile</span>
        </div>
        <h2 className="text-2xl font-bold text-white mt-1">Configure Your AI Stylist Brief</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Tell Gemini what you are shopping for today across Zara, Calvin Klein, and Hugo Boss.
        </p>
      </div>

      {/* 1. What are you looking for */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-zinc-300 flex items-center space-x-2">
          <Shirt className="w-4 h-4 text-amber-400" />
          <span>1. What are you looking for?</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categories.map((c) => {
            const isSelected = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id);
                  handleUpdate(budget, c.id, vibe, selectedBrands);
                }}
                className={`flex flex-col items-start p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? "bg-amber-400/10 border-amber-400/80 shadow-lg shadow-amber-500/10 text-white"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
                }`}
              >
                <span className="text-2xl mb-1.5">{c.icon}</span>
                <span className="font-semibold text-sm text-white">{c.label}</span>
                <span className="text-xs text-zinc-400 mt-0.5">{c.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Fashion Sense / Vibe */}
      <div className="space-y-3">
        <label className="text-xs uppercase tracking-wider font-semibold text-zinc-300 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>2. What is your fashion sense / occasion?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {vibes.map((v) => {
            const isSelected = vibe === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVibe(v.id);
                  handleUpdate(budget, category, v.id, selectedBrands);
                }}
                className={`p-3.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-amber-400/10 border-amber-400/80 shadow-md shadow-amber-500/10"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/[0.05]"
                }`}
              >
                <div className="text-xl mb-1">{v.emoji}</div>
                <div>
                  <div className="font-semibold text-sm text-white">{v.label}</div>
                  <div className="text-[11px] text-zinc-400 leading-tight mt-0.5">{v.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Budget Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase tracking-wider font-semibold text-zinc-300 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>3. Max Target Budget:</span>
          </label>
          <span className="text-lg font-bold text-amber-300">
            ${budget} <span className="text-xs font-normal text-zinc-400">USD</span>
          </span>
        </div>

        <input
          type="range"
          min={40}
          max={600}
          step={10}
          value={budget}
          onChange={(e) => {
            const val = Number(e.target.value);
            setBudget(val);
            handleUpdate(val, category, vibe, selectedBrands);
          }}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Preset budget pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: "Accessible ($75)", val: 75 },
            { label: "Contemporary ($150)", val: 150 },
            { label: "Premium ($300)", val: 300 },
            { label: "Luxury Runway ($500+)", val: 500 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => {
                setBudget(preset.val);
                handleUpdate(preset.val, category, vibe, selectedBrands);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                budget === preset.val
                  ? "bg-amber-400 text-black font-semibold"
                  : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Target Brands */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs uppercase tracking-wider font-semibold text-zinc-300">
          Target Fashion Houses
        </label>
        <div className="flex flex-wrap gap-3">
          {(["Zara", "Calvin Klein", "Boss"] as Brand[]).map((brand) => {
            const active = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => toggleBrand(brand)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  active
                    ? "bg-zinc-100 text-black border-white shadow"
                    : "bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span>{brand}</span>
                {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {onProceedToMirror && (
        <div className="pt-4 flex justify-end">
          <button
            onClick={onProceedToMirror}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-black hover:brightness-110 shadow-lg shadow-amber-500/25 transition-all"
          >
            <span>Proceed to Live Mirror & Styling</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
