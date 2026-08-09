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
  CheckCircle,
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
    id: "os",
    category: "Operating Systems",
    icon: Cpu,
    color: "from-blue-600 to-indigo-600",
    description: "Master process control, deadlocks, and virtual memory management.",
    subtopics: [
      { name: "Process Synchronization & Semaphores", description: "Critical sections, Mutex locks, Counting Semaphores, Peterson's Algorithm." },
      { name: "Deadlocks & Banker's Algorithm", description: "4 Coffman conditions, deadlock prevention, detection, resource allocation graphs." },
      { name: "Virtual Memory & Paging", description: "Page tables, Translation Lookaside Buffer (TLB), Page Faults, LRU replacement." },
    ],
  },
  {
    id: "ds",
    category: "Data Structures & Algorithms",
    icon: Network,
    color: "from-cyan-600 to-blue-600",
    description: "Balanced tree rotations, shortest path graph traversals, and hash functions.",
    subtopics: [
      { name: "Trees & Self-Balancing BSTs", description: "AVL Trees, Red-Black Trees balancing rotations, B-Trees, and Trie structures." },
      { name: "Graph Algorithms & Shortest Path", description: "Dijkstra's Algorithm, Bellman-Ford, BFS/DFS, Minimum Spanning Trees." },
      { name: "Hashing & Collision Resolution", description: "Hash functions, Separate Chaining, Open Addressing, Quadratic Probing." },
    ],
  },
  {
    id: "dbms",
    category: "Database Management Systems",
    icon: Database,
    color: "from-blue-500 to-emerald-600",
    description: "Relational normal forms, ACID concurrency primitives, and B+ tree indexes.",
    subtopics: [
      { name: "Database Normalization (1NF to BCNF)", description: "Functional dependencies, candidate keys, loss-less join decomposition." },
      { name: "Transactions & ACID Concurrency", description: "Two-Phase Locking (2PL), Serializability, Isolation levels, WAL logging." },
      { name: "B+ Tree Indexing & Query Optimization", description: "Clustered vs Non-clustered indexing, B+ Tree search operations, cost model." },
    ],
  },
  {
    id: "cn",
    category: "Computer Networks",
    icon: Globe,
    color: "from-indigo-600 to-blue-500",
    description: "Layered protocol stack, TCP connection handshake, and CIDR subnetting.",
    subtopics: [
      { name: "TCP/IP Protocol Suite & 3-Way Handshake", description: "SYN/ACK connection establishment, TCP sliding window flow control." },
      { name: "IP Routing Protocols & Algorithms", description: "Distance Vector (RIP), Link State (OSPF), BGP path vector forwarding." },
      { name: "Subnetting & CIDR Addressing", description: "IPv4 subnets, Subnet Mask calculation, CIDR notation, Network broadcast." },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Topic Hub Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore CS Core Subjects
          </h1>
          <p className="text-sm text-slate-300">
            Select any pre-configured core topic below or type your custom topic to launch the 3-Step Adaptive Engine.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Ready for Evaluation</div>
            <div className="text-sm font-bold text-white">4 Core Modules • 12 Topics</div>
          </div>
        </div>
      </div>

      {/* Custom Topic Input Bar */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
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
              placeholder="Type any topic to start learning... (e.g. Cache Coherence Protocols, Raft Consensus, Trie Ingestion)"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 transition"
            />
          </div>
          <button
            type="submit"
            className="electric-button text-white px-6 py-3 rounded-xl font-bold text-sm shadow-electric-glow flex items-center justify-center gap-2 shrink-0"
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
              className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 hover:border-slate-700 transition"
            >
              {/* Category Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${subject.color} shadow-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{subject.category}</h3>
                  <p className="text-xs text-slate-400 mt-1">{subject.description}</p>
                </div>
              </div>

              {/* Subtopics List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Pre-configured Modules
                </span>
                <div className="space-y-2.5">
                  {subject.subtopics.map((subtopic) => (
                    <button
                      key={subtopic.name}
                      onClick={() => handleTopicSelect(`${subject.category} - ${subtopic.name}`)}
                      className="w-full text-left p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-electric-500 hover:bg-slate-850 transition-all duration-200 group flex items-center justify-between"
                    >
                      <div className="pr-4 space-y-1">
                        <h4 className="text-sm font-bold text-slate-200 group-hover:text-electric-300 transition">
                          {subtopic.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {subtopic.description}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-electric-500/10 group-hover:bg-electric-600 flex items-center justify-center text-electric-400 group-hover:text-white shrink-0 transition">
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
