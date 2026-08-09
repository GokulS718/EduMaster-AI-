"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useLearning } from "@/context/LearningContext";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { 
  User, 
  Mail, 
  Calendar, 
  Flame, 
  Award, 
  CheckCircle2, 
  Zap
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const { completedTopics, contributions, stats } = useLearning();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"}
            alt={user?.name || "Student"}
            className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-emerald-500 shadow-emerald-glow p-1 shrink-0"
          />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {user?.name || "Alex Mercer"}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              {user?.email || "alex.mercer@edumaster.ai"}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Joined {user?.joinedDate || "Jan 2024"}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" /> Active Student
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Overall Accuracy</div>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              {stats.overallAccuracy}%
            </div>
          </div>
          <div className="text-center border-x border-slate-800 px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Topics Mastered</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {stats.totalTopicsMastered}
            </div>
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Active Streak</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 fill-amber-400" /> {stats.activeStreak} Days
            </div>
          </div>
        </div>
      </div>

      {/* LeetCode / GitHub 52-Week Activity Heatmap */}
      <ActivityHeatmap contributions={contributions} />

      {/* Completed Topics History Table */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              Completed Topics History
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Detailed breakdown of past 2-mark mock questions, missing terms review, and mastery scores.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            {completedTopics.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-4">Topic & Subject</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">2-Mark Score</th>
                <th className="py-3 px-4">Quiz Score</th>
                <th className="py-3 px-4">Mastery Score</th>
                <th className="py-3 px-4">Reviewed Missing Terms</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {completedTopics.map((record) => (
                <tr key={record.id} className="hover:bg-slate-950/60 transition">
                  <td className="py-4 px-4 font-bold text-white max-w-xs">
                    {record.topic}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 font-semibold border border-slate-800">
                      {record.level}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-extrabold text-amber-400">
                    {record.step2Score} / 2.0
                  </td>
                  <td className="py-4 px-4 font-extrabold text-emerald-400">
                    {record.quizScore}%
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black">
                      {record.overallMasteryScore}%
                    </span>
                  </td>
                  <td className="py-4 px-4 max-w-xs">
                    <div className="space-y-1">
                      {record.missingPointsReviewed.map((pt, idx) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5 line-clamp-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-medium">
                    {record.completedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
