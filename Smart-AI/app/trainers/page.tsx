"use client";

import { motion } from "framer-motion";
import { Dumbbell, Flame, Sparkles, Star, ArrowRight } from "lucide-react";

export default function TrainersPage() {
  const trainers = [
    {
      name: "Neural Alpha",
      specialty: "High-Intensity Bias",
      rating: "4.9",
      experience: "8,200+ Sessions",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
      color: "from-zinc-900 to-black"
    },
    {
      name: "Aria Kinetic",
      specialty: "Biomechanical Recovery",
      rating: "5.0",
      experience: "5,400+ Sessions",
      image: "https://images.unsplash.com/photo-1548690312-e3b507d17a4d?auto=format&fit=crop&q=80&w=400",
      color: "from-zinc-800 to-zinc-950"
    },
    {
      name: "Flux Core",
      specialty: "Neural Priming",
      rating: "4.8",
      experience: "12,000+ Sessions",
      image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&q=80&w=400",
      color: "from-zinc-700 to-zinc-900"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12"
    >
      <header className="border-b border-border pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <p className="zara-subheading mb-2">Expert Roster</p>
          <h1 className="text-4xl font-light tracking-tight text-foreground">AI Trainer Studio</h1>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Sort by: <span className="text-foreground">Performance</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {trainers.map((trainer) => (
          <div key={trainer.name} className="minimal-card p-0 overflow-hidden group">
            <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
               <img src={trainer.image} alt={trainer.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
               <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Certified AI</p>
                     <h3 className="text-2xl font-light text-white">{trainer.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-white">
                     <Star className="h-3 w-3 fill-white" />
                     <span className="text-xs font-black">{trainer.rating}</span>
                  </div>
               </div>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  <div className="space-y-1">
                     <p>Specialty</p>
                     <p className="text-foreground">{trainer.specialty}</p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p>Track Record</p>
                     <p className="text-foreground">{trainer.experience}</p>
                  </div>
               </div>
               <button className="w-full flex items-center justify-between pt-6 border-t border-border group-hover:border-foreground transition-colors text-[10px] font-black uppercase tracking-widest text-foreground">
                  View Profile <ArrowRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}