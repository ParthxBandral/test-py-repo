"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Dumbbell, ArrowRight, X, Camera, Flame, Target, Zap, Volume2, VolumeX, Mic, MicOff } from "lucide-react";

const REP_MESSAGES: Record<number, string> = {
  1: "Good start.",
  2: "Nice, keep going.",
  3: "You can do more.",
  4: "One more.",
  5: "Strong rep.",
  6: "Push, push.",
  7: "Stay tight.",
  8: "Excellent.",
  9: "Finish strong.",
  10: "Great set."
};

const MOTIVATIONAL_PHRASES = [
  "Keep it up.",
  "Strong work.",
  "Let’s go.",
  "Stay with it.",
  "You’ve got this."
];

export default function LiveTrainerPage() {
  const [status, setStatus] = useState<string>("Standby");
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ rep_count: 0, form_status: "Awaiting tracking...", exercise: "" });
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const lastRepRef = useRef(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const recognitionRef = useRef<any>(null);

  const exercises = [
    { id: "squat", title: "Squat", icon: Dumbbell, desc: "Hip, knee, and ankle angle tracking.", color: "from-fuchsia-400 to-purple-500" },
    { id: "curl", title: "Bicep Curl", icon: Activity, desc: "Elbow extension and flexion tracking.", color: "from-cyan-400 to-blue-500" },
    { id: "pushup", title: "Push-up", icon: Flame, desc: "Shoulder-elbow 90-degree break.", color: "from-orange-400 to-red-500" },
    { id: "jumping_jack", title: "Jumping Jack", icon: Zap, desc: "Cardio extremity extension.", color: "from-yellow-400 to-amber-500" },
    { id: "lunge", title: "Lunges", icon: Target, desc: "Bilateral knee depth tracking.", color: "from-emerald-400 to-green-500" },
  ];

  // Initialize Speech and load Voice
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        const energeticVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'))
                          || voices.find(v => v.name.toLowerCase().includes('google'))
                          || voices.find(v => v.lang.startsWith('en'))
                          || voices[0];
        voiceRef.current = energeticVoice;
      };
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    // Initialize Speech Recognition for Voice Commands
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice Command Received:", command);

        if (command.includes("stop") || command.includes("terminate") || command.includes("close")) {
          stopTrainer();
        } else {
          // Check for exercise start commands
          exercises.forEach(ex => {
            if (command.includes(`start ${ex.id.replace('_', ' ')}`) || command.includes(`start ${ex.title.toLowerCase()}`)) {
              launchTrainer(ex.id);
            }
          });
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start();
      };
    }
  }, [isListening]);

  const toggleVoiceCommands = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      speak("Voice commands active. Say start followed by exercise name.");
    }
  };

  const speak = (text: string) => {
    if (synthRef.current && voiceFeedback) {
      synthRef.current.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.volume = 1;
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      synthRef.current.speak(utterance);
    }
  };

  // Handle Rep Audio Motivation
  useEffect(() => {
    if (isRunning && stats.rep_count > lastRepRef.current) {
      const currentRep = stats.rep_count;
      lastRepRef.current = currentRep;
      
      let message = "";
      if (currentRep <= 10) {
        message = REP_MESSAGES[currentRep];
      } else {
        const phraseIdx = (currentRep - 11) % MOTIVATIONAL_PHRASES.length;
        message = MOTIVATIONAL_PHRASES[phraseIdx];
      }
      
      speak(`Good rep ${currentRep}. ${message}`);
    }
  }, [stats.rep_count, isRunning]);

  const launchTrainer = async (exercise: string) => {
    try {
      setStatus(`Initializing ${exercise}...`);
      setIsRunning(false); 
      lastRepRef.current = 0;
      setStats({ rep_count: 0, form_status: "Initializing...", exercise: exercise });
      
      speak(`Initializing ${exercise} session. Get ready.`);
      
      await fetch('/api/run-trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercise })
      });

      setTimeout(() => {
        setIsRunning(true);
        setStatus(`Recording`);
        speak("Camera active. Start your first rep.");
      }, 3000);
    } catch (e) {
      console.error(e);
      setStatus("Error");
      speak("Connection failed.");
    }
  };

  const stopTrainer = async () => {
    try {
      setStatus("Terminating...");
      setIsRunning(false);
      const total = stats.rep_count;
      speak(`Great session. You completed ${total} reps. Well done.`);
      
      if (total > 0 && stats.exercise) {
        const stored = window.localStorage.getItem("m1etrepx-workouts");
        let list = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch (e) {}
        }
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newSession = {
          id: Date.now().toString(),
          exercise: stats.exercise,
          reps: total,
          date: "Today",
          time: timeStr,
          intensity: "95% EFFICIENCY"
        };
        list.unshift(newSession);
        window.localStorage.setItem("m1etrepx-workouts", JSON.stringify(list));
      }
      
      setStats({ rep_count: 0, form_status: "Awaiting tracking...", exercise: "" });
      await fetch('/api/stop-trainer', { method: 'POST' });
      setStatus("Standby");
    } catch (e) {
      console.error(e);
      setStatus("Error");
    }
  };

  // Fast Polling for Stats
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://127.0.0.1:5000/stats');
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (err) {}
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-7xl mx-auto pb-16 space-y-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6 transition-colors duration-300">
        <div>
          <p className="zara-subheading mb-2">Live Studio</p>
          <h1 className="text-4xl font-light tracking-tight text-foreground flex items-center gap-3">
            Motion Tracking
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm">
            <button 
              onClick={toggleVoiceCommands}
              className={`flex items-center gap-2 px-4 py-2 border transition-all ${isListening ? 'bg-red-600 border-red-600 text-white animate-pulse' : 'border-border text-muted-foreground hover:border-foreground'}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="text-[10px] uppercase tracking-widest font-black">
                {isListening ? "Listening Commands" : "Voice Commands"}
              </span>
            </button>

            <button 
              onClick={() => setVoiceFeedback(!voiceFeedback)}
              className={`flex items-center gap-2 px-3 py-1.5 border transition-all ${voiceFeedback ? 'border-foreground bg-foreground text-background shadow-lg' : 'border-border text-muted-foreground opacity-50'}`}
            >
              {voiceFeedback ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              <span className="text-[10px] uppercase tracking-widest font-bold">Feedback</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Status: <span className="text-foreground font-black">{status}</span>
              </span>
              <div className={`h-2.5 w-2.5 rounded-full ${isRunning ? 'bg-zara-red animate-pulse shadow-[0_0_10px_rgba(122,0,0,0.5)]' : 'bg-border'}`}></div>
            </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-12">
        <AnimatePresence>
          {isRunning && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-foreground bg-background transition-colors shadow-2xl">
                <div className="flex items-center justify-between border-b border-foreground p-5">
                  <span className="text-xs uppercase tracking-widest font-black flex items-center gap-2 text-foreground">
                    <div className="h-2 w-2 rounded-full bg-zara-red animate-pulse" />
                    Live Stream Active
                  </span>
                  <button 
                    onClick={stopTrainer}
                    className="text-xs uppercase tracking-[0.2em] font-black hover:text-zara-red transition-colors flex items-center gap-2 text-foreground group"
                  >
                    <X className="h-4 w-4 group-hover:rotate-90 transition-transform" strokeWidth={3} /> Terminate
                  </button>
                </div>

                <div className="grid md:grid-cols-[1.5fr_1fr] gap-0">
                  <div className="relative aspect-video md:aspect-auto min-h-[250px] sm:min-h-[350px] md:min-h-[450px] border-b md:border-b-0 md:border-r border-foreground bg-foreground/5">
                    <img 
                      src="http://127.0.0.1:5000/video_feed" 
                      alt="Live Camera Feed"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 sm:p-10 flex flex-col justify-center space-y-6 sm:space-y-12 bg-background">
                    <div className="space-y-4">
                      <p className="zara-subheading">Module</p>
                      <h2 className="text-5xl font-light tracking-tighter capitalize text-foreground">
                        {stats.exercise || "..."}
                      </h2>
                    </div>

                    <div className="space-y-4 border-t border-border pt-10">
                      <p className="zara-subheading">Progress</p>
                      <div className="flex items-baseline gap-4">
                        <span className="text-8xl font-serif tracking-tighter text-foreground leading-none">
                          {stats.rep_count}
                        </span>
                        <span className="text-xs uppercase tracking-[0.3em] font-black text-muted-foreground">Reps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-lg font-light tracking-wide uppercase text-foreground">Exercise Catalog</h3>
            <span className="zara-subheading">{exercises.length} Protocols Loaded</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exercises.map((ex) => {
              const Icon = ex.icon;
              return (
                <div key={ex.id} className="minimal-card group flex flex-col justify-between h-full space-y-12">
                  <div>
                    <div className="relative h-16 w-16 flex items-center justify-center border-2 border-border bg-background mb-10 z-10 transition-all group-hover:border-foreground">
                      <span className={`absolute inset-0 blur-md bg-gradient-to-br ${ex.color} opacity-40 dark:opacity-20 z-[-1] animate-pulse group-hover:opacity-80 dark:group-hover:opacity-40 transition-opacity`}></span>
                      <Icon className="h-7 w-7 text-foreground" strokeWidth={1} />
                    </div>
                    <h2 className="text-2xl font-light mb-4 text-foreground">{ex.title}</h2>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">
                      {ex.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => launchTrainer(ex.id)}
                    className="w-full inline-flex items-center justify-between border-t border-border pt-6 group-hover:border-foreground transition-colors"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">
                      Initialize
                    </span>
                    <ArrowRight className="h-5 w-5 transform group-hover:translate-x-3 transition-transform text-foreground" strokeWidth={1} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
