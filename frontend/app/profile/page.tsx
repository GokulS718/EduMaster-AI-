"use client";

import React, { useState, useEffect } from "react";
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
  Zap,
  Loader2,
  Database,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface ApiAssessment {
  id: number;
  topic: string;
  level: string;
  step2Score: number;
  quizScore: number;
  overallMasteryScore: number;
  missingPointsJson: string;
  completedAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { completedTopics, contributions, stats } = useLearning();

  const [dbRecords, setDbRecords] = useState<ApiAssessment[]>([]);
  const [loadingDb, setLoadingDb] = useState<boolean>(true);

  // Fetch assessment history dynamically from Spring Boot / PostgreSQL REST API (Port 8080)
  useEffect(() => {
    async function fetchAssessments() {
      try {
        const res = await fetch("http://localhost:8080/api/assessments");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbRecords(data);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch assessments from Port 8080, using context store:", err);
      } finally {
        setLoadingDb(false);
      }
    }
    fetchAssessments();
  }, []);

  // Merge DB records and local records dynamically
  const displayRecords = dbRecords.length > 0 ? dbRecords : completedTopics.map((t, idx) => ({
    id: idx + 1,
    topic: t.topic,
    level: t.level,
    step2Score: t.step2Score,
    quizScore: t.quizScore,
    overallMasteryScore: t.overallMasteryScore,
    missingPointsJson: JSON.stringify(t.missingPointsReviewed),
    completedAt: t.completedAt,
  }));

  const parseMissingPoints = (jsonStr: string): string[] => {
    if (!jsonStr) return ["Definitions & syntax rules"];
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return [jsonStr];
  };

  const calculatedAccuracy = displayRecords.length > 0
    ? Math.round(displayRecords.reduce((acc, curr) => acc + curr.overallMasteryScore, 0) / displayRecords.length)
    : 0;

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
              {user?.name || "Student User"}
            </h1>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              {user?.email || "student@edumaster.ai"}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Joined {user?.joinedDate || "Aug 2026"}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Database className="w-3.5 h-3.5" /> PostgreSQL Synced
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner (Dynamic) */}
        <div className="grid grid-cols-3 gap-4 bg-[#0B0F19] p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Overall Accuracy</div>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              {calculatedAccuracy}%
            </div>
          </div>
          <div className="text-center border-x border-slate-800 px-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Topics Mastered</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {displayRecords.length}
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

      {/* Completed Topics History Table from Spring Boot / PostgreSQL */}
      <div className="glass-card p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              PostgreSQL Assessment History
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Detailed record of Section A 2-mark scores, Section B quiz scores, and missing technical terms synced with PostgreSQL REST API (Port 8080).
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {displayRecords.length} DB Records
          </span>
        </div>

        {loadingDb ? (
          <div className="py-12 flex items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <span className="text-xs text-slate-400 animate-pulse ml-2">
              Loading assessment records from http://localhost:8080/api/assessments...
            </span>
          </div>
        ) : displayRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Topic & Subject</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Section A Score</th>
                  <th className="py-3 px-4">Section B Quiz</th>
                  <th className="py-3 px-4">Overall Mastery</th>
                  <th className="py-3 px-4">Reviewed Missing Terms</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs">
                {displayRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-[#0B0F19]/60 transition">
                    <td className="py-4 px-4 font-bold text-white max-w-xs">
                      {record.topic}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#0B0F19] text-slate-300 font-semibold border border-slate-800">
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
                        {parseMissingPoints(record.missingPointsJson).map((pt, idx) => (
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
        ) : (
          /* Clean Empty State when student has not completed any topic yet */
          <div className="py-12 px-4 text-center space-y-4 bg-[#0B0F19] rounded-2xl border border-slate-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">No Assessment Records Found Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Launch the 3-Step Learning Engine to complete your first topic assessment. Your Section A scores, Section B quiz results, and activity heatmap will update here automatically!
              </p>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 emerald-button text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-emerald-glow"
            >
              <span>Explore Topics & Launch Engine</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
