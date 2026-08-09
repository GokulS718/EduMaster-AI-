"use client";

import React, { useState } from "react";
import { Calendar, Flame } from "lucide-react";

interface ActivityHeatmapProps {
  contributions: Record<string, number>;
}

export function ActivityHeatmap({ contributions }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  const today = new Date();
  const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];
  
  const totalDays = 52 * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (totalDays - 1));

  let totalContributions = 0;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = contributions[dateStr] || 0;
    totalContributions += count;
    days.push({
      dateStr,
      count,
      dayOfWeek: d.getDay(),
    });
  }

  const weeks: { dateStr: string; count: number }[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-900 border border-slate-800 hover:border-slate-600";
    if (count === 1) return "bg-emerald-950 border border-emerald-800/80 hover:border-emerald-500";
    if (count === 2) return "bg-emerald-800 border border-emerald-600 hover:border-emerald-400";
    if (count === 3) return "bg-emerald-600 border border-emerald-400 hover:border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]";
    return "bg-emerald-400 border border-emerald-200 hover:border-white shadow-[0_0_12px_rgba(52,211,153,0.65)]";
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-700/80 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            LeetCode-Style Activity Heatmap
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Daily CS sub-topic study contributions & mastery sessions over the past year.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Total Contributions:</span>
            <span className="text-sm font-extrabold text-white">{totalContributions}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Wrapper */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Months header */}
          <div className="flex text-[10px] text-slate-400 mb-2 pl-7 font-semibold">
            {months.map((m, idx) => (
              <div key={m + idx} className="flex-1 text-left">
                {m}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Days of week labels */}
            <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-semibold pr-2">
              <span className="h-3 leading-3">Mon</span>
              <span className="h-3 leading-3 opacity-0">Tue</span>
              <span className="h-3 leading-3">Wed</span>
              <span className="h-3 leading-3 opacity-0">Thu</span>
              <span className="h-3 leading-3">Fri</span>
              <span className="h-3 leading-3 opacity-0">Sat</span>
              <span className="h-3 leading-3">Sun</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => (
                    <div
                      key={day.dateStr + dIdx}
                      onMouseEnter={() => setHoveredDay({ date: day.dateStr, count: day.count })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3 h-3 rounded-[3px] transition-all duration-150 cursor-pointer ${getColorClass(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Legend & Tooltip readout */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/60">
            <div className="h-4">
              {hoveredDay ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                  {hoveredDay.count} contribution{hoveredDay.count === 1 ? "" : "s"} on {hoveredDay.date}
                </span>
              ) : (
                <span className="text-slate-400">Hover over any square for activity breakdown</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-[3px] bg-slate-900 border border-slate-800" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-950 border border-emerald-800" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-800 border border-emerald-600" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-600 border border-emerald-400" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-400 border border-white" />
              </div>
              <span className="text-[11px]">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
