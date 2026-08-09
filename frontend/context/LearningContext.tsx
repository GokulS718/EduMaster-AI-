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
  question1?: string;
  question2?: string;
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
      } catch (e) {
        setCompletedTopics([]);
      }
    } else {
      setCompletedTopics([]);
    }

    if (savedContributions) {
      try {
        setContributions(JSON.parse(savedContributions));
      } catch (e) {
        setContributions({});
      }
    } else {
      setContributions({});
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
    : 0;

  // Dynamic active streak calculation based on consecutive daily activity
  const calculateStreak = (): number => {
    const dates = Object.keys(contributions).sort().reverse();
    if (dates.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (contributions[dateStr] && contributions[dateStr] > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // If today has no contribution yet, check yesterday to keep active streak
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const stats = {
    overallAccuracy: avgQuizScore,
    totalTopicsMastered,
    activeStreak: calculateStreak(),
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
