"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/context/LearningContext";
import { 
  Search, 
  Sparkles, 
  Cpu, 
  Network, 
  Database, 
  Globe, 
  ArrowRight, 
  Zap,
  BookOpen
} from "lucide-react";

interface Subtopic {
  name: string;
  description: string;
}

interface SubjectCard {
  id: string;
  category: string;
  icon: any;
  description: string;
  color: string;
  subtopics: Subtopic[];
}

const SUBJECT_CARDS: SubjectCard[] = [
  {
    id: "dbms",
    category: "SQL & Relational Databases",
    icon: Database,
    color: "from-emerald-600 to-teal-600",
    description: "Master SQL queries, joins, subqueries, grouping, aggregate functions, and B+ tree indexes.",
    subtopics: [
      { name: "SQL Select, Filtering & Expressions", description: "SELECT, WHERE, column aliases, pattern matching." },
      { name: "SQL Joins (INNER, LEFT, RIGHT, FULL)", description: "Multi-table relational joins, foreign key matching." },
      { name: "SQL Group By & Having Clauses", description: "Summarizing data rows and filtering aggregated groups." },
      { name: "Database Normalization (1NF to BCNF)", description: "Functional dependencies, candidate keys, loss-less join." },
    ],
  },
  {
    id: "os",
    category: "Operating Systems",
    icon: Cpu,
    color: "from-indigo-600 to-emerald-600",
    description: "Master process control, semaphores, deadlock algorithms, and virtual memory paging.",
    subtopics: [
      { name: "Process Synchronization & Semaphores", description: "Critical sections, Mutex locks, Counting Semaphores." },
      { name: "Deadlocks & Banker's Algorithm", description: "4 Coffman conditions, deadlock prevention, RAG graphs." },
      { name: "Virtual Memory & Paging", description: "Page tables, Translation Lookaside Buffer (TLB), LRU." },
    ],
  },
  {
    id: "ds",
    category: "Data Structures & Algorithms",
    icon: Network,
    color: "from-amber-600 to-emerald-600",
    description: "Balanced tree rotations, shortest path graph traversals, and hash collision resolution.",
    subtopics: [
      { name: "Trees & Self-Balancing BSTs", description: "AVL Trees, Red-Black Trees color rotations, B-Trees." },
      { name: "Graph Algorithms & Shortest Path", description: "Dijkstra's Algorithm, Bellman-Ford, BFS/DFS, MST." },
      { name: "Hashing & Collision Resolution", description: "Hash functions, Separate Chaining, Open Addressing." },
    ],
  },
  {
    id: "cn",
    category: "Computer Networks",
    icon: Globe,
    color: "from-teal-600 to-indigo-600",
    description: "Layered protocol stack, TCP connection handshake, and CIDR subnetting.",
    subtopics: [
      { name: "TCP/IP Protocol Suite & 3-Way Handshake", description: "SYN/ACK connection establishment, sliding window." },
      { name: "IP Routing Protocols & Algorithms", description: "Distance Vector (RIP), Link State (OSPF), BGP path vector." },
      { name: "Subnetting & CIDR Addressing", description: "IPv4 subnets, Subnet Mask calculation, CIDR notation." },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { startEngineWithTopic } = useLearning();
  const [customTopic, setCustomTopic] = useState("");

  const handleTopicSelect = (topicName: string) => {
    if (!topicName.trim()) return;
    startEngineWithTopic(topicName.trim());
    router.push("/engine");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    handleTopicSelect(customTopic);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-3xl border border-slate-700/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Topic Hub Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore CS Core Subjects
          </h1>
          <p className="text-sm text-slate-300">
            Select any pre-configured core topic below or type your custom topic to launch the 3-Stage Sub-Topic Engine.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Ready for Evaluation</div>
            <div className="text-sm font-bold text-white">4 Core Modules • 14 Sub-Topics</div>
          </div>
        </div>
      </div>

      {/* Custom Topic Input Bar */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/80 space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Custom Topic Launcher
        </label>
        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type any topic to start learning... (e.g. SQL Joins & Aggregates, Cache Coherence, Raft Consensus)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            className="emerald-button text-white px-6 py-3 rounded-xl font-bold text-sm shadow-emerald-glow flex items-center justify-center gap-2 shrink-0"
          >
            <span>Launch Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SUBJECT_CARDS.map((subject) => {
          const Icon = subject.icon;
          return (
            <div
              key={subject.id}
              className="glass-card p-6 rounded-3xl border border-slate-700/80 space-y-6 hover:border-slate-600 transition"
            >
              {/* Category Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${subject.color} shadow-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{subject.category}</h3>
                  <p className="text-xs text-slate-300 mt-1">{subject.description}</p>
                </div>
              </div>

              {/* Subtopics List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Pre-configured Sub-Topics
                </span>
                <div className="space-y-2.5">
                  {subject.subtopics.map((subtopic) => (
                    <button
                      key={subtopic.name}
                      onClick={() => handleTopicSelect(`${subject.category} - ${subtopic.name}`)}
                      className="w-full text-left p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-emerald-500 hover:bg-slate-750 transition-all duration-200 group flex items-center justify-between"
                    >
                      <div className="pr-4 space-y-1">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition">
                          {subtopic.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {subtopic.description}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-400 group-hover:text-white shrink-0 transition">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
