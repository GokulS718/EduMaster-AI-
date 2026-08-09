"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLearning, KnowledgeLevel } from "@/context/LearningContext";
import { 
  Search, 
  Sparkles, 
  Cpu, 
  Network, 
  Database, 
  Globe, 
  ArrowRight, 
  Zap,
  Code2,
  Terminal,
  Layers,
  CheckCircle2
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

const ALL_SUBJECT_CARDS: SubjectCard[] = [
  {
    id: "sql",
    category: "SQL & Relational Databases",
    icon: Database,
    color: "from-emerald-600 to-teal-600",
    description: "Master SELECT queries, joins, subqueries, grouping, aggregate functions, and B+ tree indexes.",
    subtopics: [
      { name: "SQL Select, Filtering & Expressions", description: "SELECT, WHERE, column aliases, pattern matching." },
      { name: "SQL Joins (INNER, LEFT, RIGHT, FULL)", description: "Multi-table relational joins, foreign key matching." },
      { name: "SQL Group By & Having Clauses", description: "Summarizing data rows and filtering aggregated groups." },
      { name: "Clustered B+ Tree Indexing", description: "Doubly-linked leaf nodes and fast range scan queries." },
    ],
  },
  {
    id: "os",
    category: "Operating Systems",
    icon: Cpu,
    color: "from-indigo-600 to-teal-600",
    description: "Master process scheduling, semaphores, deadlock prevention, and virtual memory paging.",
    subtopics: [
      { name: "Process Scheduling & Context Switching", description: "Round Robin, Priority, Multilevel Feedback Queue." },
      { name: "Critical Section & Semaphores", description: "Mutex locks, Counting Semaphores, Peterson's Algorithm." },
      { name: "Deadlocks & Prevention", description: "4 Coffman conditions, Banker's Algorithm, RAG graphs." },
      { name: "Paging & Virtual Memory", description: "Page tables, Translation Lookaside Buffer (TLB), LRU." },
    ],
  },
  {
    id: "dsa",
    category: "Data Structures & Algorithms",
    icon: Network,
    color: "from-amber-600 to-emerald-600",
    description: "Balanced tree rotations, shortest path graph traversals, and hash collision resolution.",
    subtopics: [
      { name: "Trees & Self-Balancing BSTs", description: "AVL Trees, Red-Black Trees color rotations, B-Trees." },
      { name: "Graph Algorithms & Shortest Path", description: "Dijkstra's Algorithm, Bellman-Ford, BFS/DFS, MST." },
      { name: "Hashing & Collision Resolution", description: "Hash functions, Separate Chaining, Open Addressing." },
      { name: "Dynamic Programming & Memoization", description: "Optimal substructure, overlapping subproblems." },
    ],
  },
  {
    id: "cn",
    category: "Computer Networks",
    icon: Globe,
    color: "from-cyan-600 to-emerald-600",
    description: "Layered protocol stack, TCP connection handshake, and CIDR subnetting.",
    subtopics: [
      { name: "TCP/IP Protocol Suite & 3-Way Handshake", description: "SYN/ACK connection establishment, sliding window." },
      { name: "IP Routing Protocols & Algorithms", description: "Distance Vector (RIP), Link State (OSPF), BGP path vector." },
      { name: "Subnetting & CIDR Addressing", description: "IPv4 subnets, Subnet Mask calculation, CIDR notation." },
    ],
  },
  {
    id: "java",
    category: "Java Programming & Concurrency",
    icon: Terminal,
    color: "from-teal-600 to-emerald-600",
    description: "OOP fundamentals, multithreading synchronization, collections framework, and JVM memory.",
    subtopics: [
      { name: "Object-Oriented Programming (OOP)", description: "Inheritance, Polymorphism, Abstraction, Encapsulation." },
      { name: "Java Multithreading & ExecutorService", description: "Synchronized blocks, Volatile variables, Thread Pools." },
      { name: "Collections Framework & Generics", description: "ArrayList, HashMap bucket distribution, ConcurrentHashMap." },
    ],
  },
  {
    id: "python",
    category: "Python & Data Engineering",
    icon: Code2,
    color: "from-emerald-600 to-cyan-600",
    description: "Pythonic data structures, list comprehensions, decorators, generators, and Pandas workflows.",
    subtopics: [
      { name: "Pythonic Control Flow & Generators", description: "Yield expressions, iterators, list comprehensions." },
      { name: "Decorators & Metaprogramming", description: "Function wrappers, class decorators, args/kwargs." },
      { name: "Data Manipulation with Pandas & NumPy", description: "DataFrames, vectorization, indexing, groupby." },
    ],
  },
  {
    id: "webdev",
    category: "Full-Stack Web Development",
    icon: Layers,
    color: "from-violet-600 to-emerald-600",
    description: "Modern Async JS/TS, React Hooks, Next.js Server Components, and REST/GraphQL API design.",
    subtopics: [
      { name: "Async JavaScript & Event Loop", description: "Promises, Async/Await, Microtask queue, Call stack." },
      { name: "React State & Custom Hooks", description: "useState, useEffect, useReducer, custom hook patterns." },
      { name: "REST API & HTTP Fundamentals", description: "HTTP methods, status codes, CORS, JWT authentication." },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { startEngineWithTopic, setLevel } = useLearning();
  const [customTopic, setCustomTopic] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel>("Intermediate");

  const handleTopicSelect = (topicName: string) => {
    if (!topicName.trim()) return;
    startEngineWithTopic(topicName.trim(), selectedLevel);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card p-8 rounded-3xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Topic Hub Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore All CS & IT Topics
          </h1>
          <p className="text-sm text-slate-300">
            Select your knowledge level and pick any computer science subject below, or type a custom topic to launch the scrolling 3-step engine.
          </p>
        </div>

        {/* Knowledge Level Selector */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block px-1">Select Knowledge Level</span>
          <div className="flex gap-2">
            {[
              { lvl: "Easy", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
              { lvl: "Intermediate", color: "bg-[#818CF8]/20 text-[#818CF8] border-[#818CF8]/40" },
              { lvl: "Advanced", color: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
            ].map((item) => (
              <button
                key={item.lvl}
                onClick={() => {
                  const l = item.lvl as KnowledgeLevel;
                  setSelectedLevel(l);
                  setLevel(l);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                  selectedLevel === item.lvl
                    ? `${item.color} shadow-lg scale-105`
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {item.lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Topic Input Bar */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Custom CS / IT Topic Launcher
        </label>
        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Type any CS/IT topic (e.g. Cache Coherence Protocols, Raft Consensus, Trie Ingestion, Distributed Systems)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <button
            type="submit"
            className="emerald-button text-white px-6 py-3 rounded-xl font-bold text-sm shadow-emerald-glow flex items-center justify-center gap-2 shrink-0"
          >
            <span>Launch Engine ({selectedLevel})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_SUBJECT_CARDS.map((subject) => {
          const Icon = subject.icon;
          return (
            <div
              key={subject.id}
              className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-6 hover:border-emerald-500/40 transition"
            >
              {/* Category Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${subject.color} shadow-lg text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{subject.category}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{subject.description}</p>
              </div>

              {/* Subtopics List */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Sub-Topics
                </span>
                <div className="space-y-2 pt-1">
                  {subject.subtopics.map((subtopic) => (
                    <button
                      key={subtopic.name}
                      onClick={() => handleTopicSelect(`${subject.category} - ${subtopic.name}`)}
                      className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 hover:bg-slate-900 transition-all duration-200 group flex items-center justify-between"
                    >
                      <div className="pr-2">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">
                          {subtopic.name}
                        </h4>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition shrink-0" />
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
