"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLearning } from "@/context/LearningContext";
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Target, 
  Award,
  Zap,
  BookOpen
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-electric-600/10 border border-electric-500/30 text-electric-400 text-xs font-semibold tracking-wide uppercase shadow-electric-glow">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Next-Gen AI Mastery Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Master Computer Science with <br />
          <span className="electric-gradient-text">Adaptive 3-Step Re-Teaching</span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop passive reading. EduMaster AI analyzes your written answers, identifies critical missing concepts, and immediately re-teaches you until 100% topic mastery is achieved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto electric-button text-white px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 group shadow-electric-strong"
          >
            <span>Explore Topics</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/engine"
            className="w-full sm:w-auto glass-card text-slate-200 hover:text-white px-8 py-4 rounded-xl font-bold text-base border border-slate-700 hover:border-electric-500 transition-all flex items-center justify-center gap-2"
          >
            <Cpu className="w-5 h-5 text-electric-400" />
            <span>Launch Engine</span>
          </Link>
        </div>
      </div>

      {/* 3-Step Engine Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-electric-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-black text-xl">
            1
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-electric-400" /> Initial Teaching
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Get 3 ultra-concise, high-yield bullet points tailored to your knowledge level (Beginner, Intermediate, Advanced).
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-electric-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-black text-xl">
            2
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-electric-400" /> Mock Evaluation
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Answer a 2-mark university mock question. AI grades your answer (0.0 - 2.0 marks), isolates missing points, and provides targeted re-teaching.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-electric-500/50 transition">
          <div className="w-12 h-12 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-black text-xl">
            3
          </div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-electric-400" /> Mastery Quiz
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Take 3 targeted MCQs generated specifically on your missing points to lock in knowledge and unlock your Topic Mastery Scorecard.
          </p>
        </div>
      </div>

      {/* Featured Quick Launch Topics */}
      <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-electric-400 fill-electric-400" /> Popular Subjects Ready to Launch
            </h2>
            <p className="text-sm text-slate-400">Click any topic to pre-fill the 3-Step Engine immediately</p>
          </div>
          <Link
            href="/dashboard"
            className="text-electric-400 font-semibold text-sm hover:underline flex items-center gap-1"
          >
            View All Subjects →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { topic: "Process Synchronization & Semaphores", category: "Operating Systems" },
            { topic: "Red-Black Trees & Balancing", category: "Data Structures" },
            { topic: "Database Normalization (1NF to BCNF)", category: "DBMS" },
            { topic: "TCP/IP 3-Way Handshake", category: "Networks" },
          ].map((item) => (
            <button
              key={item.topic}
              onClick={() => handleQuickLaunch(item.topic)}
              className="text-left p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-electric-500 hover:bg-slate-850 transition-all duration-200 group"
            >
              <span className="text-[10px] uppercase font-bold tracking-wider text-electric-400">
                {item.category}
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-electric-300 mt-1 line-clamp-2">
                {item.topic}
              </h4>
              <div className="mt-3 flex items-center text-xs text-slate-400 group-hover:text-white font-medium">
                Start Lesson <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
