"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type KnowledgeLevel = "Easy" | "Beginner" | "Intermediate" | "Advanced";

export interface SubTopicLesson {
  id: number;
  title: string;
  overview: string;
  detailedExplanation: string;
  keyRules: string[];
  codeExample: string;
  question?: string;
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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
  subTopics: SubTopicLesson[];
  setSubTopics: (subTopics: SubTopicLesson[]) => void;
  completedTopics: CompletedTopicRecord[];
  contributions: Record<string, number>;
  addCompletedTopic: (record: Omit<CompletedTopicRecord, "id" | "completedAt">) => void;
  stats: {
    overallAccuracy: number;
    totalTopicsMastered: number;
    activeStreak: number;
  };
  startEngineWithTopic: (topic: string, level?: KnowledgeLevel) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [selectedTopic, setSelectedTopic] = useState<string>("SQL Queries & Joins");
  const [level, setLevel] = useState<KnowledgeLevel>("Intermediate");
  const [subTopics, setSubTopics] = useState<SubTopicLesson[]>([]);
  const [completedTopics, setCompletedTopics] = useState<CompletedTopicRecord[]>([]);
  const [contributions, setContributions] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedHistory = localStorage.getItem("edumaster_history");
    const savedContributions = localStorage.getItem("edumaster_contributions");
    
    if (savedHistory) {
      try {
        setCompletedTopics(JSON.parse(savedHistory));
      } catch (e) {}
    } else {
      const dummyHistory: CompletedTopicRecord[] = [
        {
          id: "hist-1",
          topic: "SQL Queries & Inner Joins",
          level: "Intermediate",
          step2Score: 1.8,
          quizScore: 90,
          overallMasteryScore: 92,
          missingPointsReviewed: ["Filtering order between WHERE and HAVING"],
          completedAt: "2026-08-05",
        },
        {
          id: "hist-[#2]",
          topic: "Operating Systems — Process Synchronization",
          level: "Advanced",
          step2Score: 2.0,
          quizScore: 100,
          overallMasteryScore: 100,
          missingPointsReviewed: ["Compare-And-Swap lock-free retry mechanics"],
          completedAt: "2026-08-07",
        },
      ];
      setCompletedTopics(dummyHistory);
    }

    if (savedContributions) {
      try {
        setContributions(JSON.parse(savedContributions));
      } catch (e) {}
    } else {
      const today = new Date().toISOString().split("T")[0];
      const mockContribs: Record<string, number> = {
        [today]: 3,
        "2026-08-08": 2,
        "2026-08-07": 4,
        "2026-08-06": 1,
        "2026-08-05": 3,
        "2026-08-03": 2,
        "2026-08-01": 1,
      };
      setContributions(mockContribs);
    }
  }, []);

  const addCompletedTopic = (recordData: Omit<CompletedTopicRecord, "id" | "completedAt">) => {
    const today = new Date().toISOString().split("T")[0];
    const newRecord: CompletedTopicRecord = {
      ...recordData,
      id: `hist-${Date.now()}`,
      completedAt: today,
    };

    const updated = [newRecord, ...completedTopics];
    setCompletedTopics(updated);
    localStorage.setItem("edumaster_history", JSON.stringify(updated));

    const updatedContribs = {
      ...contributions,
      [today]: (contributions[today] || 0) + 1,
    };
    setContributions(updatedContribs);
    localStorage.setItem("edumaster_contributions", JSON.stringify(updatedContribs));
  };

  const startEngineWithTopic = (topic: string, newLevel?: KnowledgeLevel) => {
    setSelectedTopic(topic);
    if (newLevel) setLevel(newLevel);
    setSubTopics([]);
  };

  const totalTopicsMastered = completedTopics.length;
  const avgQuizScore = completedTopics.length > 0
    ? Math.round(completedTopics.reduce((acc, curr) => acc + curr.overallMasteryScore, 0) / completedTopics.length)
    : 88;

  const stats = {
    overallAccuracy: avgQuizScore,
    totalTopicsMastered,
    activeStreak: 5,
  };

  return (
    <LearningContext.Provider
      value={{
        selectedTopic,
        setSelectedTopic,
        level,
        setLevel,
        subTopics,
        setSubTopics,
        completedTopics,
        contributions,
        addCompletedTopic,
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
