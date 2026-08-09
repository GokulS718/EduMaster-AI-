"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearning } from "@/context/LearningContext";
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Target, 
  Award,
  Zap,
  BookOpen,
  Code
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { startEngineWithTopic } = useLearning();

  const handleQuickLaunch = (topic: string) => {
    startEngineWithTopic(topic);
    router.push("/engine");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 space-y-20">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase shadow-emerald-glow">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Sub-Topic Breakdown & Adaptive Re-Teaching
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Master CS Topics with <br />
          <span className="emerald-gradient-text">Sub-Topic Breakdown & Code Cards</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Learn 4–5 core sub-topics with syntax code blocks, answer 2-mark university questions for AI feedback, and unlock 5 to 7 targeted MCQs to achieve 100% mastery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto emerald-button text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 group shadow-emerald-strong"
          >
            <span>Explore Topics</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/engine"
            className="w-full sm:w-auto glass-card text-slate-200 hover:text-white px-8 py-4 rounded-xl font-bold text-base border border-slate-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
          >
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Launch Engine</span>
          </Link>
        </div>
      </div>

      {/* 3-Stage Workflow Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-700/80 space-y-4 hover:border-emerald-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
            1
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" /> Stage 1: Sub-Topics
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Break down main topics into 4–5 core sub-topics with example-driven teaching cards and code syntax blocks.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-700/80 space-y-4 hover:border-emerald-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xl">
            2
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" /> Stage 2: Mock Question
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Answer a specific 2-mark university question. Get scored (0.0 to 2.0 marks), missing technical terms, and targeted re-teaching.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-700/80 space-y-4 hover:border-emerald-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
            3
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" /> Stage 3: 5–7 MCQs
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Take 5 to 7 MCQs covering all sub-topics with instant explanation feedback and Topic Mastery Scorecard.
          </p>
        </div>
      </div>

      {/* Featured Quick Launch Topics */}
      <div className="glass-card p-8 rounded-3xl border border-slate-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400" /> Popular Subjects Ready to Launch
            </h2>
            <p className="text-sm text-slate-300">Click any topic to pre-fill the 3-Stage Engine</p>
          </div>
          <Link
            href="/dashboard"
            className="text-emerald-400 font-bold text-sm hover:underline flex items-center gap-1"
          >
            View All Subjects →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { topic: "SQL Queries, Joins & Grouping", category: "DBMS" },
            { topic: "Process Synchronization & Semaphores", category: "Operating Systems" },
            { topic: "Trees & Red-Black Balancing", category: "Data Structures" },
            { topic: "TCP/IP 3-Way Handshake", category: "Networks" },
          ].map((item) => (
            <button
              key={item.topic}
              onClick={() => handleQuickLaunch(item.topic)}
              className="text-left p-4 rounded-2xl bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-slate-750 transition-all duration-200 group"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {item.category}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 mt-2 line-clamp-2">
                {item.topic}
              </h4>
              <div className="mt-3 flex items-center text-xs text-slate-400 group-hover:text-white font-semibold">
                Start Lesson <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
