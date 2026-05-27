"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut, 
  ChevronRight, 
  Heart, 
  Activity as ActivityIcon, 
  Moon, 
  Zap,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Watch
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [connectedService, setConnectedService] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [healthData, setHealthData] = useState({
    steps: "8,432",
    hrv: "64 ms",
    sleep: "7h 12m",
    calories: "1,240 kcal"
  });

  if (!user) return null;

  const handleConnect = (service: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      setConnectedService(service);
      setIsSyncing(false);
    }, 2500);
  };

  const menuItems = [
    { label: "Account Information", desc: "Manage your personal and biometric data.", icon: User },
    { label: "Preferences", desc: "System notifications and theme settings.", icon: Settings },
    { label: "Security", desc: "Encryption keys and session management.", icon: Shield },
    { label: "Membership", desc: "Current tier: Platinum Neural Access.", icon: CreditCard },
  ];

  const healthServices = [
    { id: "apple", name: "Apple Health", icon: Heart, color: "bg-red-600", text: "text-red-600" },
    { id: "google", name: "Google Fit", icon: ActivityIcon, color: "bg-blue-500", text: "text-blue-500" },
    { id: "samsung", name: "Samsung Health", icon: Watch, color: "bg-orange-500", text: "text-orange-500" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-12 pb-16 sm:pb-20"
    >
      <header className="border-b border-border pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-w-0">
          <div className="h-16 w-16 border border-foreground flex items-center justify-center bg-foreground text-background shadow-2xl shrink-0">
             <User className="h-8 w-8" strokeWidth={1} />
          </div>
          <div className="space-y-1 min-w-0">
            <p className="zara-subheading">Authenticated Operator</p>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight">{user.name}</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest break-all">{user.email}</p>
          </div>
        </div>
        <button onClick={logout} className="w-full sm:w-auto p-4 border border-border hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2">
           <LogOut className="h-5 w-5" />
           <span className="text-[10px] font-black uppercase tracking-widest sm:hidden">Sign Out</span>
        </button>
      </header>

      {/* Cross-Platform Health Bridge */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
          <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Cross-Platform Bio-Link</h2>
          <span className="zara-subheading">Neural Sync v2.1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthServices.map((service) => (
            <div 
              key={service.id} 
              className={`minimal-card p-6 flex flex-col items-center text-center gap-4 transition-all duration-500 ${connectedService === service.id ? 'border-foreground bg-foreground/5 shadow-xl' : 'border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
            >
              <div className={`h-12 w-12 flex items-center justify-center rounded-xl transition-all ${connectedService === service.id ? `${service.color} text-white shadow-lg` : 'bg-background border border-border text-muted-foreground'}`}>
                <service.icon className={`h-6 w-6 ${connectedService === service.id ? 'animate-pulse' : ''}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-widest">{service.name}</h3>
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  Sync biometric data from your {service.id === 'apple' ? 'iOS' : 'Android'} ecosystem.
                </p>
              </div>
              <button 
                onClick={() => handleConnect(service.id)}
                disabled={isSyncing}
                className={`w-full py-3 text-[9px] font-black uppercase tracking-widest transition-all ${connectedService === service.id ? 'text-foreground border border-foreground' : 'bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground'}`}
              >
                {isSyncing && connectedService === null ? (
                  <RefreshCw className="h-3 w-3 animate-spin mx-auto" />
                ) : connectedService === service.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Linked
                  </span>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {connectedService && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden pt-6"
            >
              {[
                { label: "Step Count", value: healthData.steps, icon: ActivityIcon, color: "text-orange-500" },
                { label: "Heart Rate (HRV)", value: healthData.hrv, icon: Heart, color: "text-red-500" },
                { label: "Deep Sleep", value: healthData.sleep, icon: Moon, color: "text-indigo-500" },
                { label: "Metabolic Burn", value: healthData.calories, icon: Zap, color: "text-yellow-500" },
              ].map((stat) => (
                <div key={stat.label} className="minimal-card p-6 flex flex-col items-center text-center gap-4">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
                  <div className="space-y-1">
                    <p className="text-xl font-serif">{stat.value}</p>
                    <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Main Settings Menu */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
          <h2 className="text-base sm:text-lg font-light tracking-wide uppercase text-foreground">Operator Settings</h2>
          <span className="zara-subheading">{menuItems.length} Control Nodes</span>
        </div>
        {menuItems.map((item) => (
          <div key={item.label} className="minimal-card p-5 sm:p-8 group cursor-pointer flex items-center justify-between hover:bg-foreground/5 gap-4">
            <div className="flex items-center gap-4 sm:gap-8 min-w-0">
              <item.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" strokeWidth={1} />
              <div className="space-y-1 min-w-0">
                <h3 className="text-base sm:text-lg font-light truncate">{item.label}</h3>
                <p className="text-xs text-muted-foreground font-light truncate">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-2 transition-all shrink-0" />
          </div>
        ))}
      </div>

      <div className="border border-border p-6 sm:p-8 bg-background flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-widest text-muted-foreground text-center md:text-left">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>Neural OS Compatibility: iOS & Android Ready</span>
         </div>
         <div className="text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-widest text-muted-foreground">
            M1ETREPX v1.0.4-Neural
         </div>
      </div>
    </motion.div>
  );
}