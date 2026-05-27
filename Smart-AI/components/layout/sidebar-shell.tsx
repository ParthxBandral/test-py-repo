"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  Activity,
  Dumbbell,
  Brain,
  Salad,
  Camera,
  UserCircle2,
  MessageCircle,
  Sun,
  Moon,
  HeartPulse,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

const navItems = [
  { label: "Dashboard", href: "/", icon: Activity },
  { label: "Trainers", href: "/trainers", icon: Dumbbell },
  { label: "Workout Planner", href: "/planners/workout", icon: Brain },
  { label: "Diet Planner", href: "/planners/diet", icon: Salad },
  { label: "AI Coach", href: "/chatbot", icon: MessageCircle },
  { label: "Medical Support", href: "/medical", icon: HeartPulse },
  { label: "Live Trainer", href: "/live-trainer", icon: Camera },
  { label: "Explore", href: "/explore", icon: MapPin },
  { label: "Profile", href: "/profile", icon: UserCircle2 },
];

export function SidebarShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide sidebar on auth pages
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("fitfusion-theme") as "dark" | "light";
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    window.localStorage.setItem("fitfusion-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans transition-colors duration-300 overflow-x-hidden">
      {/* ─── MOBILE TOP BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border">
        <span className="relative text-xl font-serif tracking-tight text-foreground inline-block z-10">
          <span className="absolute inset-0 blur-lg bg-gradient-to-r from-red-600 via-foreground/20 to-red-600 opacity-30 dark:opacity-40 z-[-1] animate-pulse"></span>
          M1ETREP<span className="text-red-600 dark:text-red-500">X</span>
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="h-10 w-10 flex items-center justify-center border border-border text-foreground hover:bg-foreground hover:text-background transition-all"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {/* ─── MOBILE SLIDE-OVER MENU ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-[86vw] max-w-72 bg-background border-r border-border flex flex-col justify-between px-6 py-20 overflow-y-auto animate-[slideInLeft_0.2s_ease-out]">
            <div className="space-y-10">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-4 py-3.5 text-sm font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-red-600' : ''}`} strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-6">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] uppercase tracking-widest font-black text-foreground hover:text-muted-foreground transition-colors"
              >
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                {theme === "light" ? <Moon className="h-3 w-3" strokeWidth={2} /> : <Sun className="h-3 w-3" strokeWidth={2} />}
              </button>

              {user && (
                <div className="flex items-center justify-between border border-border p-3 text-[10px] uppercase tracking-widest text-foreground bg-background">
                  <div className="overflow-hidden">
                    <p className="font-bold truncate">{user.name}</p>
                  </div>
                  <span className="font-black border-l border-border pl-3 flex-shrink-0">
                    {user.membershipTier}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="w-72 flex-shrink-0 flex flex-col justify-between border-r border-border bg-background px-8 py-10 transition-colors hidden md:flex">
        <div className="space-y-12">
          <div className="flex flex-col">
            <span className="relative text-2xl font-serif tracking-tight text-foreground inline-block z-10">
              <span className="absolute inset-0 blur-lg bg-gradient-to-r from-red-600 via-foreground/20 to-red-600 opacity-30 dark:opacity-40 z-[-1] animate-pulse"></span>
              M1ETREP<span className="text-red-600 dark:text-red-500">X</span>
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-4 py-3 text-sm font-medium uppercase tracking-widest transition-colors ${isActive ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-red-600' : ''}`} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-6">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-3 border-t border-b border-border text-[10px] uppercase tracking-widest font-black text-foreground hover:text-muted-foreground transition-colors"
          >
            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            {theme === "light" ? <Moon className="h-3 w-3" strokeWidth={2} /> : <Sun className="h-3 w-3" strokeWidth={2} />}
          </button>

          <div className="text-xs text-muted-foreground leading-relaxed space-y-4 font-medium transition-colors">
            <p>M1ETREPX: Minimal AI fitness OS.</p>
            {user ? (
              <div className="flex items-center justify-between border border-border p-3 text-[10px] uppercase tracking-widest text-foreground bg-background">
                <div className="overflow-hidden">
                  <p className="font-bold truncate">{user.name}</p>
                </div>
                <span className="font-black border-l border-border pl-3 flex-shrink-0">
                  {user.membershipTier}
                </span>
              </div>
            ) : (
              <Link 
                href="/auth/login"
                className="block w-full text-center py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-background hover:text-foreground border border-foreground transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-10 pt-20 md:pt-10 pb-10 flex flex-col bg-background transition-colors">
        {children}
      </main>
    </div>
  );
}
