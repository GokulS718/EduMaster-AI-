import React from "react";
import { Sparkles, Shield, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060913] py-8 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-electric-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-200">EduMaster AI</span>
          <span className="text-slate-500">— 3-Step Adaptive Mastery Engine</span>
        </div>
        <div className="flex items-center space-x-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-electric-400" /> Powered by Gemini API
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Next.js 14 App Router
          </span>
        </div>
      </div>
    </footer>
  );
}
