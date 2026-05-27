"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ email, name });
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
             <UserPlus className="h-8 w-8 text-foreground" strokeWidth={1} />
          </div>
          <p className="zara-subheading text-red-600">Operator Registration</p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">
            Neural Signup
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-background border border-border px-4 sm:px-6 py-4 sm:py-5 text-sm font-light focus:outline-none focus:border-foreground transition-all"
              />
            </div>
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
          </div>

          <button
            type="submit"
            className="w-full py-5 sm:py-6 px-3 bg-foreground text-background text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] hover:bg-background hover:text-foreground border border-foreground transition-all flex items-center justify-center gap-4 group"
          >
            Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </form>

        <footer className="text-center space-y-4">
          <p className="text-xs text-muted-foreground font-light">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-foreground font-bold hover:underline">
              Secure Login
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