"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type KnowledgeLevel = "Beginner" | "Intermediate" | "Advanced";

export interface SubTopicLesson {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Step2EvaluationResult {
  score: number;
  maxScore: number;
  missingPoints: string[];
  targetedReTeaching: string[];
  masteryQuiz: MCQQuestion[];
}

export interface CompletedTopicRecord {
  id: string;
  topic: string;
  level: KnowledgeLevel;
  step2Score: number;
  quizScore: number;
  overallMasteryScore: number;
  missingPointsReviewed: string[];
  completedAt: string;
}

interface LearningContextType {
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  level: KnowledgeLevel;
  setLevel: (level: KnowledgeLevel) => void;
  activeStep: 1 | 2 | 3;
  setActiveStep: (step: 1 | 2 | 3) => void;
  
  subTopics: SubTopicLesson[];
  setSubTopics: (subTopics: SubTopicLesson[]) => void;
  twoMarkQuestion: string;
  setTwoMarkQuestion: (q: string) => void;
  
  step2Evaluation: Step2EvaluationResult | null;
  setStep2Evaluation: (evalData: Step2EvaluationResult | null) => void;

  completedTopics: CompletedTopicRecord[];
  addCompletedTopic: (record: Omit<CompletedTopicRecord, "id" | "completedAt">) => void;
  
  contributions: Record<string, number>;
  stats: {
    overallAccuracy: number;
    totalTopicsMastered: number;
    activeStreak: number;
  };

  startEngineWithTopic: (topic: string, lvl?: KnowledgeLevel) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const INITIAL_COMPLETED_TOPICS: CompletedTopicRecord[] = [
  {
    id: "hist-1",
    topic: "SQL Queries, Joins & Grouping",
    level: "Intermediate",
    step2Score: 1.8,
    quizScore: 100,
    overallMasteryScore: 95,
    missingPointsReviewed: ["WHERE vs HAVING clause ordering distinction", "NULL values handling in aggregate AVG()"],
    completedAt: "2026-08-08",
  },
  {
    id: "hist-2",
    topic: "Operating Systems - Process Synchronization",
    level: "Advanced",
    step2Score: 1.5,
    quizScore: 83,
    overallMasteryScore: 88,
    missingPointsReviewed: ["Mutex vs Counting Semaphore ownership", "Priority Inversion inheritance protocol"],
    completedAt: "2026-08-07",
  },
  {
    id: "hist-3",
    topic: "DBMS - B+ Tree Indexing & Page Split",
    level: "Intermediate",
    step2Score: 2.0,
    quizScore: 100,
    overallMasteryScore: 100,
    missingPointsReviewed: ["Sequential scan efficiency of doubly linked leaf nodes"],
    completedAt: "2026-08-05",
  },
  {
    id: "hist-4",
    topic: "Computer Networks - TCP 3-Way Handshake",
    level: "Beginner",
    step2Score: 1.6,
    quizScore: 100,
    overallMasteryScore: 92,
    missingPointsReviewed: ["Initial Sequence Number (ISN) randomization for security"],
    completedAt: "2026-08-02",
  },
];

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [selectedTopic, setSelectedTopic] = useState<string>("SQL Queries & Relational DBMS");
  const [level, setLevel] = useState<KnowledgeLevel>("Intermediate");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  
  const [subTopics, setSubTopics] = useState<SubTopicLesson[]>([]);
  const [twoMarkQuestion, setTwoMarkQuestion] = useState<string>("");
  const [step2Evaluation, setStep2Evaluation] = useState<Step2EvaluationResult | null>(null);
  
  const [completedTopics, setCompletedTopics] = useState<CompletedTopicRecord[]>(INITIAL_COMPLETED_TOPICS);
  const [contributions, setContributions] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("edumaster_history");
      if (storedHistory) {
        setCompletedTopics(JSON.parse(storedHistory));
      }
      
      const storedContributions = localStorage.getItem("edumaster_contributions");
      if (storedContributions) {
        setContributions(JSON.parse(storedContributions));
      } else {
        const map: Record<string, number> = {};
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          
          const rand = Math.random();
          if (i < 14) {
            map[dateStr] = Math.floor(Math.random() * 5) + 1;
          } else if (rand > 0.6) {
            map[dateStr] = Math.floor(Math.random() * 4) + 1;
          } else {
            map[dateStr] = 0;
          }
        }
        setContributions(map);
        localStorage.setItem("edumaster_contributions", JSON.stringify(map));
      }
    } catch {
      // Fallback
    }
  }, []);

  const addCompletedTopic = (record: Omit<CompletedTopicRecord, "id" | "completedAt">) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const newRecord: CompletedTopicRecord = {
      ...record,
      id: `hist-${Date.now()}`,
      completedAt: todayStr,
    };

    const updatedHistory = [newRecord, ...completedTopics];
    setCompletedTopics(updatedHistory);
    localStorage.setItem("edumaster_history", JSON.stringify(updatedHistory));

    const updatedContribs = {
      ...contributions,
      [todayStr]: (contributions[todayStr] || 0) + 1,
    };
    setContributions(updatedContribs);
    localStorage.setItem("edumaster_contributions", JSON.stringify(updatedContribs));
  };

  const startEngineWithTopic = (topic: string, lvl: KnowledgeLevel = "Intermediate") => {
    setSelectedTopic(topic);
    setLevel(lvl);
    setActiveStep(1);
    setSubTopics([]);
    setTwoMarkQuestion("");
    setStep2Evaluation(null);
  };

  const totalTopicsMastered = completedTopics.length;
  const avgMasteryScore = completedTopics.length > 0
    ? Math.round(completedTopics.reduce((acc, curr) => acc + curr.overallMasteryScore, 0) / completedTopics.length)
    : 92;

  const stats = {
    overallAccuracy: avgMasteryScore,
    totalTopicsMastered,
    activeStreak: 12,
  };

  return (
    <LearningContext.Provider
      value={{
        selectedTopic,
        setSelectedTopic,
        level,
        setLevel,
        activeStep,
        setActiveStep,
        subTopics,
        setSubTopics,
        twoMarkQuestion,
        setTwoMarkQuestion,
        step2Evaluation,
        setStep2Evaluation,
        completedTopics,
        addCompletedTopic,
        contributions,
        stats,
        startEngineWithTopic,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
}
