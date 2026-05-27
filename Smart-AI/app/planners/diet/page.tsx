"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Salad, Download, Sparkles } from "lucide-react";

interface DietPlan {
  title: string;
  blocks: { label: string; detail: string }[];
}

export default function DietPlannerPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DietPlan | null>(null);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    setTimeout(() => {
      setPlan({
        title: "AI-Paired Macro Framework – High Performance",
        blocks: [
          {
            label: "Baseline macros",
            detail:
              "Approx. 2.0 g protein / kg, 1.2 g carbs / kg on training days, adaptive fats based on recovery.",
          },
          {
            label: "Meal structure",
            detail:
              "4–5 feedings, front-loaded protein, carbs clustered pre/post workout, fiber throughout.",
          },
          {
            label: "Hydration & recovery",
            detail:
              "Electrolyte protocol, pre-sleep routine, caffeine cut-off tailored to wake time.",
          },
          {
            label: "Coaching notes",
            detail:
              "Track HRV and sleep; AI adjusts carbohydrates and training load based on weekly trends.",
          },
        ],
      });
      setLoading(false);
    }, 900);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)] gap-6"
    >
      <section className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              AI Diet Planner
            </p>
            <h1 className="text-xl font-semibold mt-1">
              Compose nutrition like a system
            </h1>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-electric-lime to-cyan-pulse flex items-center justify-center text-black">
            <Salad className="h-5 w-5" />
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-white/70">Objective</label>
              <select className="w-full rounded-2xl border border-glass-border bg-white/5 px-3 py-2.5 text-sm outline-none">
                <option>Recomp / lean gain</option>
                <option>Fat loss</option>
                <option>Performance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-white/70">Diet preference</label>
              <select className="w-full rounded-2xl border border-glass-border bg-white/5 px-3 py-2.5 text-sm outline-none">
                <option>Flexible</option>
                <option>Plant-forward</option>
                <option>Low-carb leaning</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-white/70">Bodyweight (kg)</label>
              <input
                type="number"
                min={35}
                max={200}
                defaultValue={72}
                className="w-full rounded-2xl border border-glass-border bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-white/70">Training days / week</label>
              <input
                type="number"
                min={1}
                max={7}
                defaultValue={4}
                className="w-full rounded-2xl border border-glass-border bg-white/5 px-3 py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white/70">Notes / constraints</label>
            <textarea
              rows={3}
              placeholder="No lactose, prefers 2 big meals + 1 snack, trains evenings..."
              className="w-full rounded-2xl border border-glass-border bg-white/5 px-3 py-2.5 text-sm outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-electric-lime px-4 py-2.5 text-sm font-semibold text-black shadow-[0_18px_45px_rgba(204,255,0,0.35)] hover:brightness-110 transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? "Composing protocol..." : "Generate nutrition map"}
            <Sparkles className="h-4 w-4" />
          </button>
        </form>
      </section>

      <section className="glass-panel p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">AI Output – PDF style card</p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-xl border border-glass-border bg-white/5 px-3 py-1.5 text-[11px] text-white/70 hover:bg-white/10"
          >
            <Download className="h-3 w-3" />
            Download PDF (stub)
          </button>
        </div>

        <div className="relative flex-1 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-5 py-4 text-xs overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="h-20 w-64 overflow-hidden rounded-2xl border border-electric-lime/60 bg-black/60">
                <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-electric-lime/60 to-transparent animate-shimmer" />
              </div>
            </div>
          )}

          {plan ? (
            <div className="space-y-3 relative z-0">
              <h2 className="text-sm font-semibold mb-1">{plan.title}</h2>
              {plan.blocks.map((block) => (
                <div key={block.label} className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    {block.label}
                  </p>
                  <p className="text-[11px] text-white/80">{block.detail}</p>
                </div>
              ))}
              <p className="text-[10px] text-white/40 pt-2 border-t border-white/10 mt-2">
                Generated by Smart AI Gym engine. Export to PDF from your
                operator console.
              </p>
            </div>
          ) : (
            <p className="text-[11px] text-white/50">
              Feed in constraints on the left and the AI will output a clean,
              member-ready protocol here.
            </p>
          )}
        </div>
      </section>
    </motion.div>
  );
}