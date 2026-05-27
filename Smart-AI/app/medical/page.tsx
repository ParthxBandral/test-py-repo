"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HeartPulse, 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  Stethoscope, 
  Zap, 
  Brain, 
  ChevronRight, 
  AlertCircle,
  Thermometer,
  Dumbbell,
  Clock,
  Target,
  Sparkles
} from "lucide-react";

const EXPERTS = [
  {
    name: "Dr. Elena Vance",
    specialty: "Sports Physiotherapist",
    focus: "ACL & Meniscus Recovery",
    tags: ["Knee Rehab", "Post-Op", "Stability"],
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
    rating: "5.0"
  },
  {
    name: "Marcus Thorne",
    specialty: "Osteopathic Specialist",
    focus: "Spinal Alignment & Lower Back",
    tags: ["Posture", "Spine", "Mobility"],
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    rating: "4.9"
  },
  {
    name: "Dr. Sarah Chen",
    specialty: "Biomechanics PhD",
    focus: "Shoulder Impingement",
    tags: ["Shoulder", "Upper Body", "Strength"],
    image: "https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=400",
    rating: "4.8"
  }
];

const CATEGORIES = [
  "Physiotherapy", "Sports Rehab", "Mobility", "Recovery", 
  "Posture Correction", "Knee Pain", "Shoulder Rehab", 
  "Lower Back Pain", "Muscle Recovery", "Injury Prevention"
];

const BODY_PARTS = [
  "Neck", "Shoulders", "Chest", "Lower Back", "Upper Back", 
  "Hips", "Knees", "Ankles", "Wrists", "Elbows"
];

export default function MedicalSupportPage() {
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [selectedPart, setSelectedPart] = useState("");
  const [painLevel, setPainLevel] = useState(5);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult({
        advice: "Avoid heavy squatting for 72 hours. Focus on eccentric quad loading and terminal knee extensions.",
        safeExercises: ["Wall Sits", "Band Pull-aparts", "Isometric Holds"],
        affectedMuscles: ["Vastus Medialis", "Patellar Tendon"],
        avoid: ["Deep Lunges", "Box Jumps", "Heavy Barbell Squats"],
        timeline: "Estimated 10-14 days for full structural loading."
      });
      setIsAnalyzing(false);
      setAssessmentStep(3);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto pb-16 sm:pb-24 space-y-12 sm:space-y-20"
    >
      <header className="border-b border-border pb-8 sm:pb-10">
        <p className="zara-subheading mb-3">Rehabilitative Hub</p>
        <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-foreground">
          Medical & Injury <span className="text-muted-foreground italic">Support</span>
        </h1>
      </header>

      {/* AI Assessment Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 sm:gap-12">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight">Describe Your Injury</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our neural engine will analyze your pain patterns, movement history, and biometric data to suggest recovery protocols.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <span key={cat} className="px-3 py-1 border border-border text-[9px] uppercase tracking-widest font-black text-muted-foreground hover:border-foreground hover:text-foreground transition-colors cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="border border-foreground bg-background p-5 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {assessmentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7 sm:space-y-10"
              >
                <div className="space-y-4">
                  <p className="zara-subheading">Step 01</p>
                  <h3 className="text-xl sm:text-2xl font-light">Select affected area</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {BODY_PARTS.map(part => (
                    <button
                      key={part}
                      onClick={() => setSelectedPart(part)}
                      className={`py-3 border text-[10px] uppercase tracking-widest font-black transition-all ${selectedPart === part ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground'}`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={!selectedPart}
                  onClick={() => setAssessmentStep(1)}
                  className="w-full py-4 sm:py-5 px-3 bg-foreground text-background text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] flex items-center justify-center gap-4 disabled:opacity-30 transition-opacity"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {assessmentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7 sm:space-y-10"
              >
                <div className="space-y-4">
                  <p className="zara-subheading">Step 02</p>
                  <h3 className="text-xl sm:text-2xl font-light">Define Intensity (Pain Scale)</h3>
                </div>
                <div className="space-y-8">
                  <div className="flex justify-between gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-widest text-muted-foreground">
                    <span>Mild Discomfort</span>
                    <span>Severe Pain</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value))}
                    className="w-full accent-foreground"
                  />
                  <div className="text-center text-6xl sm:text-7xl font-serif text-foreground">{painLevel}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button onClick={() => setAssessmentStep(0)} className="flex-1 py-4 sm:py-5 border border-border text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] hover:border-foreground transition-all">Back</button>
                  <button onClick={() => setAssessmentStep(2)} className="flex-[2] py-4 sm:py-5 bg-foreground text-background text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em]">Continue</button>
                </div>
              </motion.div>
            )}

            {assessmentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-7 sm:space-y-10"
              >
                <div className="space-y-4">
                  <p className="zara-subheading">Final Step</p>
                  <h3 className="text-xl sm:text-2xl font-light">Describe the discomfort</h3>
                </div>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Sharp pain when squatting, occurs at the bottom of the movement..."
                  className="w-full h-40 bg-background border border-border p-6 text-sm font-light focus:outline-none focus:border-foreground transition-all resize-none"
                />
                <button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-4 sm:py-5 px-3 bg-foreground text-background text-[11px] font-black uppercase tracking-[0.16em] sm:tracking-[0.3em] flex items-center justify-center gap-3 sm:gap-4 overflow-hidden relative"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-background animate-ping" /> Analyzing Metrics...
                    </span>
                  ) : (
                    <>Run AI Assessment <Sparkles className="h-4 w-4" /></>
                  )}
                </button>
              </motion.div>
            )}

            {assessmentStep === 3 && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-7 sm:space-y-10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="space-y-1">
                    <p className="zara-subheading text-emerald-600">Neural Diagnosis Ready</p>
                    <h3 className="text-xl sm:text-2xl font-light">Recovery Roadmap</h3>
                  </div>
                  <button onClick={() => setAssessmentStep(0)} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Restart</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Stethoscope className="h-3 w-3" /> Core Advice
                    </p>
                    <p className="text-sm font-light leading-relaxed">{result.advice}</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3 w-3" /> Safe Alternatives
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.safeExercises.map((ex: string) => (
                        <span key={ex} className="px-3 py-1 bg-foreground/5 border border-border text-[10px] font-bold">{ex}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-red-600/5 border border-red-600/20 space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                     <AlertCircle className="h-3 w-3" /> High Risk Protocol
                   </p>
                   <p className="text-xs font-bold">Strictly Avoid: {result.avoid.join(", ")}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-8">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-black">{result.timeline}</span>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground self-end sm:self-auto">
                    Save to Profile <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Recovery Experts Cards */}
      <section className="space-y-8 sm:space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
          <div>
            <p className="zara-subheading mb-2">Medical Roster</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">Recovery & Rehab Experts</h2>
          </div>
          <button className="w-full md:w-auto px-6 py-3 md:py-2 border border-border text-[10px] font-black uppercase tracking-widest hover:border-foreground transition-all">
            View All Specialists
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {EXPERTS.map((expert) => (
            <div key={expert.name} className="minimal-card p-0 overflow-hidden group">
              <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                <img src={expert.image} alt={expert.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 flex justify-between items-end gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Certified Specialist</p>
                    <h3 className="text-xl sm:text-2xl font-light text-white">{expert.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                    <Target className="h-3 w-3 text-red-600" />
                    <span className="text-xs font-black">{expert.rating}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[10px] uppercase tracking-widest font-black">
                    <span className="text-muted-foreground">Expertise</span>
                    <span className="text-foreground">{expert.specialty}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[10px] uppercase tracking-widest font-black">
                    <span className="text-muted-foreground">Focus</span>
                    <span className="text-foreground">{expert.focus}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expert.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 border border-border text-[8px] uppercase tracking-tighter font-black text-muted-foreground">{tag}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                  <button className="py-3 bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground border border-foreground transition-all">
                    Consult
                  </button>
                  <button className="py-3 border border-border text-[9px] font-black uppercase tracking-widest hover:border-foreground transition-all">
                    AI Assist
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency & Warning Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 bg-red-600/5 border-y border-red-600/20 py-10 sm:py-16 px-5 sm:px-10">
        <div className="space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest">
              Emergency Warning Signs
           </div>
           <h3 className="text-2xl sm:text-3xl font-light">When to seek urgent care</h3>
           <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-md">
             If you experience any of the following after a workout, stop all activity and consult a physician immediately:
           </p>
           <ul className="grid grid-cols-1 gap-4 text-xs font-bold uppercase tracking-widest text-red-600">
              <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-red-600" /> Sudden numbness or tingling</li>
              <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-red-600" /> Sharp localized bone pain</li>
              <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-red-600" /> Visible deformity in joints</li>
              <li className="flex items-center gap-3"><div className="h-1.5 w-1.5 rounded-full bg-red-600" /> Inability to bear any weight</li>
           </ul>
        </div>
        <div className="flex flex-col justify-center items-start md:items-end space-y-6">
           <div className="text-left md:text-right space-y-4">
              <h4 className="text-xl font-light italic">Neural Emergency Bridge</h4>
              <p className="text-sm font-light text-muted-foreground max-w-sm leading-relaxed">
                Connect your account to local emergency services for instant data sharing in case of severe gym-related trauma.
              </p>
           </div>
           <button className="w-full sm:w-auto px-6 sm:px-10 py-5 border-2 border-red-600 text-red-600 text-[10px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]">
              Activate Bridge
           </button>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground max-w-2xl leading-loose">
          <span className="text-foreground">DISCLAIMER:</span> This is fitness guidance only and not a replacement for professional medical diagnosis. The AI assessment is based on movement patterns and biometric data; always consult a licensed medical professional before starting any rehabilitative protocol.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-10 text-[10px] font-black uppercase tracking-widest text-foreground">
           <span>Privacy Protocol</span>
           <span>Data Encryption: Active</span>
        </div>
      </footer>
    </motion.div>
  );
}
