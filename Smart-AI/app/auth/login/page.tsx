"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email });
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] space-y-8 sm:space-y-12"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 border border-foreground flex items-center justify-center bg-background mb-4">
             <ShieldCheck className="h-8 w-8 text-foreground" strokeWidth={1} />
          </div>
          <p className="zara-subheading text-red-600">Access Portal</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            Neural Login
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Identity Identifier (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@m1etrepx.os"
              className="w-full bg-background border border-border px-4 sm:px-6 py-4 sm:py-5 text-sm font-light focus:outline-none focus:border-foreground transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Access Token
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full bg-background border border-border px-4 sm:px-6 py-4 sm:py-5 text-sm font-light focus:outline-none focus:border-foreground transition-all opacity-50 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 sm:py-6 px-3 bg-foreground text-background text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] hover:bg-background hover:text-foreground border border-foreground transition-all flex items-center justify-center gap-4 group"
          >
            Authenticate <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </form>

        <footer className="text-center space-y-4">
          <p className="text-xs text-muted-foreground font-light">
            Don't have an operator account?{" "}
            <Link href="/auth/signup" className="text-foreground font-bold hover:underline">
              Request Signup
            </Link>
          </p>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-center gap-2 sm:gap-8 text-[9px] uppercase tracking-widest text-muted-foreground font-black">
             <span>v1.0.4-Neural</span>
             <span>Secure Access Only</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}