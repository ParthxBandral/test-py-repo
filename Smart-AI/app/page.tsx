"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Flame, Crown, Sparkles, TrendingUp, ArrowRight, Dumbbell, Zap, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import Link from "next/link";

const days = ["M", "T", "W", "T", "F", "S", "S"];
const weeks = [1, 2, 3, 4];

const DEFAULT_WORKOUTS = [
  { id: "1", exercise: "bicep curl", reps: 12, date: "Yesterday", time: "08:45", intensity: "88% EFFICIENCY" },
  { id: "2", exercise: "pushup", reps: 20, date: "2 days ago", time: "18:30", intensity: "92% EFFICIENCY" },
  { id: "3", exercise: "squat", reps: 15, date: "3 days ago", time: "07:15", intensity: "85% EFFICIENCY" },
  { id: "4", exercise: "jumping_jack", reps: 50, date: "4 days ago", time: "12:00", intensity: "78% EFFICIENCY" },
  { id: "5", exercise: "lunge", reps: 16, date: "5 days ago", time: "19:10", intensity: "80% EFFICIENCY" },
  { id: "6", exercise: "bicep curl", reps: 10, date: "6 days ago", time: "08:30", intensity: "84% EFFICIENCY" },
  { id: "7", exercise: "squat", reps: 20, date: "7 days ago", time: "07:00", intensity: "90% EFFICIENCY" },
  { id: "8", exercise: "pushup", reps: 15, date: "8 days ago", time: "17:45", intensity: "86% EFFICIENCY" },
  { id: "9", exercise: "lunge", reps: 12, date: "9 days ago", time: "11:20", intensity: "75% EFFICIENCY" },
  { id: "10", exercise: "jumping_jack", reps: 40, date: "10 days ago", time: "15:30", intensity: "82% EFFICIENCY" }
];

const getExerciseMeta = (exerciseName: string) => {
  const name = (exerciseName || "").toLowerCase();
  if (name.includes("squat")) {
    return { title: "Squat", icon: Dumbbell, color: "from-fuchsia-400 to-purple-500" };
  } else if (name.includes("curl") || name.includes("bicep")) {
    return { title: "Bicep Curl", icon: Activity, color: "from-cyan-400 to-blue-500" };
  } else if (name.includes("push") || name.includes("pushup")) {
    return { title: "Push-up", icon: Flame, color: "from-orange-400 to-red-500" };
  } else if (name.includes("jack") || name.includes("jumping")) {
    return { title: "Jumping Jack", icon: Zap, color: "from-yellow-400 to-amber-500" };
  } else if (name.includes("lunge")) {
    return { title: "Lunges", icon: Target, color: "from-emerald-400 to-green-500" };
  }
  return { title: exerciseName || "Workout Session", icon: Activity, color: "from-red-400 to-red-600" };
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("m1etrepx-workouts");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const combined = [...parsed, ...DEFAULT_WORKOUTS].slice(0, 10);
          setWorkouts(combined);
        } catch (e) {
          setWorkouts(DEFAULT_WORKOUTS);
        }
      } else {
        setWorkouts(DEFAULT_WORKOUTS);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto space-y-8 sm:space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 border-b border-border pb-6">
        <div>
          <p className="zara-subheading mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground flex items-center gap-3">
            Command Center
          </h1>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4 text-sm w-full md:w-auto">
          <div className="flex flex-col items-start sm:items-end">
            <p className="zara-subheading">Today's Utilization</p>
            <p className="text-2xl font-light text-foreground">86%</p>
          </div>
          <div className="relative h-12 w-12 border border-foreground flex items-center justify-center text-foreground bg-background z-10 transition-colors">
            <span className="absolute inset-0 blur-md bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-40 dark:opacity-20 z-[-1] animate-pulse"></span>
            <TrendingUp className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-1 gap-8 sm:gap-12">
        {/* Attendance Heatmap */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">
              Attendance Heatmap
            </h2>
            <span className="zara-subheading">Last 4 weeks</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-muted-foreground uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold">
            <span>Low Utilization</span>
            <div className="flex gap-2">
              <span className="h-2 w-10 bg-foreground/5 border border-border" />
              <span className="h-2 w-10 bg-foreground/20 border border-border" />
              <span className="h-2 w-10 bg-foreground/50 border border-border" />
              <span className="h-2 w-10 bg-foreground border border-transparent" />
            </div>
            <span>Peak Session</span>
          </div>

          <div className="overflow-x-auto no-scrollbar pb-2">
            <div className="space-y-4 min-w-[400px] md:min-w-0">
              <div className="grid grid-cols-[50px_repeat(4,minmax(0,1fr))] gap-3 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                <div />
                {weeks.map((week) => (
                  <div key={week} className="text-center">Week {week}</div>
                ))}
              </div>
              {days.map((day, rowIdx) => (
                <div
                  key={`${day}-${rowIdx}`}
                  className="grid grid-cols-[50px_repeat(4,minmax(0,1fr))] gap-3 items-center"
                >
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">{day}</div>
                  {weeks.map((week, colIdx) => {
                    const intensity = (rowIdx + colIdx + 2) % 4;
                    const tones = [
                      "bg-foreground/5",
                      "bg-foreground/20",
                      "bg-foreground/50",
                      "bg-foreground",
                    ];
                    return (
                      <div
                        key={week}
                        className={`h-10 w-full border border-border ${tones[intensity]} transition-all hover:scale-[1.02] hover:border-foreground/40 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI sections preview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 pt-6 sm:pt-8">
        {/* AI Workout Blocks */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Workout Blocks</h2>
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-foreground/5 border border-border">
              <Sparkles className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">AI Synchronized</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: "Push – Neural Priming", lines: ["• Incline DB Press: 4×6-8 (RPE 8)", "• Machine Press: 3×8-10 (RPE 7)", "• Cable Fly: 3×12-15 (RPE 6)"] },
              { title: "Pull – Lat Bias", lines: ["• Tempo Rows: 4×6-8 (RPE 8)", "• Neutral Grip Pulldown: 3×8-10", "• Rear Delt Clusters: 3×12-15"] }
            ].map((block) => (
              <div key={block.title} className="minimal-card p-6 space-y-4">
                <p className="zara-subheading text-foreground font-black">
                  {block.title}
                </p>
                <div className="text-sm font-light text-muted-foreground leading-relaxed space-y-2">
                  {block.lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}
          </div>
          <button className="minimal-button w-full">
            Inspect full microcycle
          </button>
        </div>

        {/* AI Nutrition Canvas */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Nutrition Canvas</h2>
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-foreground/5 border border-border">
              <Sparkles className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Macro Optimized</span>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { title: "Baseline Macros", lines: ["• Protein: 2.0g/kg", "• Carbs: 1.2g/kg (training days)", "• Fats: ~0.8g/kg (adaptive)"] },
              { title: "Meal Structure", lines: ["• 4–5 feedings daily", "• Carbs pre/post workout", "• Hydration + electrolytes"] }
            ].map((block) => (
              <div key={block.title} className="minimal-card p-6 space-y-4">
                <p className="zara-subheading text-foreground font-black">
                  {block.title}
                </p>
                <div className="text-sm font-light text-muted-foreground leading-relaxed space-y-2">
                  {block.lines.map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            ))}
          </div>
          <button className="minimal-button w-full">
            Review metabolic plan
          </button>
        </div>

        {/* Previous Sessions (Neural Logs) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-2">
            <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Session History</h2>
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-foreground/5 border border-border">
              <Activity className="h-3 w-3 text-red-600 animate-pulse" strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Neural Logs</span>
            </div>
          </div>
          <div className="space-y-3 max-h-[385px] overflow-y-auto pr-1">
            {workouts.map((session) => {
              const meta = getExerciseMeta(session.exercise);
              const Icon = meta.icon;
              return (
                <div key={session.id} className="minimal-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 group hover:border-foreground/60 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 flex items-center justify-center border border-border bg-background group-hover:border-foreground transition-colors duration-300">
                      <span className={`absolute inset-0 blur-sm bg-gradient-to-br ${meta.color} opacity-20 group-hover:opacity-45 transition-opacity duration-300`}></span>
                      <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-foreground transition-colors group-hover:text-red-500 duration-300">{meta.title}</p>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">{session.date} • {session.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-serif tracking-tighter text-foreground font-bold">{session.reps} Reps</span>
                    <p className="text-[8px] text-red-600 dark:text-red-500 font-black uppercase tracking-widest mt-0.5">{session.intensity}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/live-trainer" className="block w-full">
            <button className="minimal-button w-full flex items-center justify-center gap-2">
              Start Live Tracker <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
