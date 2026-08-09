export interface MCQSchema {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningRecordSchema {
  id: string;
  userId: string;
  topic: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  step1Bullets: string[];
  mockAnswer: string;
  step2Score: number;
  maxScore: number;
  missingPoints: string[];
  targetedReTeaching: string[];
  quizQuestions: MCQSchema[];
  quizScorePercent: number;
  overallMasteryScore: number;
  completedAt: string;
}
