"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Mail, Lock, User as UserIcon, LogIn, UserPlus, CheckCircle2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, user, isAuthenticated } = useAuth();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (tab === "signup" && !name) {
      setError("Please enter your full name.");
      return;
    }

    if (tab === "signin") {
      login(email, name);
      setSuccess("Successfully signed in!");
    } else {
      signup(name, email);
      setSuccess("Account created successfully!");
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Container Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-700/80 shadow-emerald-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Branding */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 shadow-emerald-glow mb-2">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white">Welcome to EduMaster AI</h2>
            <p className="text-xs text-slate-300">
              {tab === "signin"
                ? "Sign in to access your adaptive sub-topic analytics"
                : "Create an account to track CS topic mastery"}
            </p>
          </div>

          {/* Logged in notification banner */}
          {isAuthenticated && user && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="text-white font-bold block">Currently Logged In</span>
                <span className="text-slate-300">As {user.name} ({user.email})</span>
              </div>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700 mb-6">
            <button
              onClick={() => {
                setTab("signin");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                tab === "signin"
                  ? "bg-emerald-600 text-white shadow-emerald-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => {
                setTab("signup");
                setError("");
              }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                tab === "signup"
                  ? "bg-emerald-600 text-white shadow-emerald-glow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" /> Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.mercer@edumaster.ai"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full emerald-button text-white py-3 rounded-xl font-bold text-sm shadow-emerald-glow hover:shadow-emerald-strong transition flex items-center justify-center gap-2"
            >
              {tab === "signin" ? "Sign In to Dashboard" : "Create Demo Account"}
            </button>
          </form>

          {/* Demo Auto-fill Helper */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <button
              onClick={() => {
                login("alex.mercer@edumaster.ai", "Alex Mercer");
                router.push("/dashboard");
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              ⚡ Instant Demo Login (Pre-filled User)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
