"use client";

import React, { useState, useEffect } from "react";
import { useLearning, KnowledgeLevel, SubTopicLesson, MCQQuestion } from "@/context/LearningContext";
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Award, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  ShieldCheck,
  Copy,
  Check,
  FileCode2,
  ListChecks,
  ChevronRight,
  GraduationCap,
  FileText
} from "lucide-react";

interface SubTopicAssessmentState {
  answer1: string;
  answer2: string;
  isEvaluating: boolean;
  evaluation: {
    score: number;
    maxScore: number;
    missingPoints: string[];
    targetedReTeaching: string[];
  } | null;
}

export default function EnginePage() {
  const {
    selectedTopic,
    level,
    setLevel,
    subTopics,
    setSubTopics,
    addCompletedTopic,
  } = useLearning();

  // PER-SUBTOPIC WIZARD FLOW:
  // Sub-Topic Index: 0, 1, 2, 3...
  // Sub-Topic View Mode: 'lesson' | 'assessment'
  // When activeSubIndex >= subTopics.length -> Final MCQ Quiz Page
  const [activeSubIndex, setActiveSubIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"lesson" | "assessment">("lesson");

  const [loadingStage1, setLoadingStage1] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Per sub-topic assessment state
  const [subAssessments, setSubAssessments] = useState<Record<number, SubTopicAssessmentState>>({});

  // Final MCQ Quiz State
  const [finalQuizQuestions, setFinalQuizQuestions] = useState<MCQQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [finalScorecard, setFinalScorecard] = useState<{
    mcqScore: number;
    overallPercent: number;
  } | null>(null);

  // Fetch Stage 1 Sub-Topics from API
  const fetchStage1Data = async (targetLevel: KnowledgeLevel = level) => {
    if (!selectedTopic.trim()) return;
    setLoadingStage1(true);
    setActiveSubIndex(0);
    setViewMode("lesson");
    try {
      const res = await fetch("/api/step1-teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, level: targetLevel }),
      });
      const data = await res.json();
      if (data.subTopics && Array.isArray(data.subTopics)) {
        setSubTopics(data.subTopics);
        
        // Initialize sub-assessments map
        const initialMap: Record<number, SubTopicAssessmentState> = {};
        data.subTopics.forEach((st: SubTopicLesson, idx: number) => {
          const idNum = st.id || idx + 1;
          initialMap[idNum] = {
            answer1: "",
            answer2: "",
            isEvaluating: false,
            evaluation: null,
          };
        });
        setSubAssessments(initialMap);
      }
    } catch (err) {
      console.error("Stage 1 fetch error:", err);
    } finally {
      setLoadingStage1(false);
    }
  };

  useEffect(() => {
    if (subTopics.length === 0 && selectedTopic) {
      fetchStage1Data();
    } else if (subTopics.length > 0 && Object.keys(subAssessments).length === 0) {
      const initialMap: Record<number, SubTopicAssessmentState> = {};
      subTopics.forEach((st, idx) => {
        const idNum = st.id || idx + 1;
        initialMap[idNum] = {
          answer1: "",
          answer2: "",
          isEvaluating: false,
          evaluation: null,
        };
      });
      setSubAssessments(initialMap);
    }
  }, [selectedTopic]);

  const handleLevelChange = (newLevel: KnowledgeLevel) => {
    if (newLevel === level) return;
    setLevel(newLevel);
    fetchStage1Data(newLevel);
  };

  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit 2-Mark Answers for Current Sub-Topic
  const handleSubTopicAssessmentSubmit = async (subTopicId: number, subTopicTitle: string) => {
    const currentState = subAssessments[subTopicId];
    if (!currentState || (!currentState.answer1.trim() && !currentState.answer2.trim())) return;

    setSubAssessments((prev) => ({
      ...prev,
      [subTopicId]: { ...prev[subTopicId], isEvaluating: true },
    }));

    const combinedAnswer = `${currentState.answer1} ${currentState.answer2}`.trim();

    try {
      const res = await fetch("/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${selectedTopic} - ${subTopicTitle}`,
          level,
          studentAnswer: combinedAnswer,
          answer1: currentState.answer1,
          answer2: currentState.answer2,
        }),
      });
      const data = await res.json();

      setSubAssessments((prev) => ({
        ...prev,
        [subTopicId]: {
          ...prev[subTopicId],
          isEvaluating: false,
          evaluation: {
            score: data.score,
            maxScore: data.maxScore || 2.0,
            missingPoints: data.missingPoints || [],
            targetedReTeaching: data.targetedReTeaching || [],
          },
        },
      }));

      if (data.masteryQuiz && Array.isArray(data.masteryQuiz) && finalQuizQuestions.length === 0) {
        setFinalQuizQuestions(data.masteryQuiz);
      }
    } catch (err) {
      console.error("Sub-topic assessment evaluation error:", err);
      setSubAssessments((prev) => ({
        ...prev,
        [subTopicId]: { ...prev[subTopicId], isEvaluating: false },
      }));
    }
  };

  const fetchFinalQuiz = async () => {
    if (finalQuizQuestions.length > 0) return;
    setLoadingQuiz(true);
    try {
      const res = await fetch("/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          level,
          studentAnswer: "Final topic quiz generation request for all sub-topics",
        }),
      });
      const data = await res.json();
      if (data.masteryQuiz && Array.isArray(data.masteryQuiz)) {
        setFinalQuizQuestions(data.masteryQuiz);
      }
    } catch (err) {
      console.error("Final quiz fetch error:", err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleQuizSubmit = () => {
    if (finalQuizQuestions.length === 0) return;
    let correctCount = 0;
    finalQuizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const mcqPercent = Math.round((correctCount / finalQuizQuestions.length) * 100);
    const evaluatedScores = Object.values(subAssessments)
      .map((s) => s.evaluation?.score || 0);
    const avgSubScore = evaluatedScores.length > 0
      ? evaluatedScores.reduce((a, b) => a + b, 0) / evaluatedScores.length
      : 1.5;
    
    const step2Percent = (avgSubScore / 2.0) * 100;
    const overallPercent = Math.round(step2Percent * 0.4 + mcqPercent * 0.6);

    setQuizSubmitted(true);
    setFinalScorecard({
      mcqScore: mcqPercent,
      overallPercent,
    });

    addCompletedTopic({
      topic: selectedTopic,
      level,
      step2Score: Math.round(avgSubScore * 10) / 10,
      quizScore: mcqPercent,
      overallMasteryScore: overallPercent,
      missingPointsReviewed: ["Sub-topic definitions & syntax rules", "Key execution steps & mechanics"],
    });
  };

  const totalSubTopics = subTopics.length;
  const isFinalQuizView = activeSubIndex >= totalSubTopics;

  const currentSubTopic: SubTopicLesson | undefined = subTopics[activeSubIndex];
  const currentSubTopicId = currentSubTopic ? (currentSubTopic.id || activeSubIndex + 1) : 1;
  const currentSubState = subAssessments[currentSubTopicId] || {
    answer1: "",
    answer2: "",
    isEvaluating: false,
    evaluation: null,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Card with Dynamic Level Switcher */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              <GraduationCap className="w-3.5 h-3.5" /> Per-Subtopic Adaptive Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {selectedTopic}
            </h1>
          </div>

          {/* DYNAMIC LEVEL SWITCHER (Easy | Intermediate | Advanced) */}
          <div className="flex items-center gap-3 bg-[#0B0F19] p-3 rounded-2xl border border-slate-800 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level Depth:</span>
            <div className="flex gap-1.5">
              {(["Easy", "Intermediate", "Advanced"] as KnowledgeLevel[]).map((lvl) => {
                const isActive = level === lvl;
                let activeStyle = "bg-emerald-600 text-white font-extrabold shadow-emerald-glow";
                if (lvl === "Easy") activeStyle = "bg-amber-500 text-slate-950 font-extrabold";
                if (lvl === "Advanced") activeStyle = "bg-rose-600 text-white font-extrabold";

                return (
                  <button
                    key={lvl}
                    onClick={() => handleLevelChange(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition ${
                      isActive
                        ? activeStyle
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Per-Subtopic Stepper Navigator */}
        {totalSubTopics > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <BookOpen className="w-4 h-4" />
                {isFinalQuizView
                  ? `Final Topic Mastery Quiz`
                  : `Sub-Topic ${activeSubIndex + 1} of ${totalSubTopics}: ${currentSubTopic?.title}`}
              </span>
              <span>
                Progress: {Math.round(((activeSubIndex * 2 + (viewMode === "assessment" ? 2 : 1)) / (totalSubTopics * 2 + 1)) * 100)}%
              </span>
            </div>

            {/* Sub-Topic Step Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {subTopics.map((st, idx) => {
                const isCurrent = activeSubIndex === idx;
                const isDone = activeSubIndex > idx;
                const stId = st.id || idx + 1;
                const hasEval = subAssessments[stId]?.evaluation !== null;

                return (
                  <React.Fragment key={stId}>
                    <button
                      onClick={() => {
                        setActiveSubIndex(idx);
                        setViewMode("lesson");
                      }}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        isCurrent && viewMode === "lesson"
                          ? "bg-emerald-500/20 border-emerald-500 text-white shadow-emerald-glow"
                          : isCurrent && viewMode === "assessment"
                          ? "bg-amber-500/20 border-amber-500 text-white"
                          : isDone || hasEval
                          ? "bg-slate-900 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-950 text-slate-300 text-[10px] flex items-center justify-center font-black">
                        {idx + 1}
                      </span>
                      <span>{st.title}</span>
                    </button>
                    {idx < totalSubTopics - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  </React.Fragment>
                );
              })}

              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => {
                  fetchFinalQuiz();
                  setActiveSubIndex(totalSubTopics);
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isFinalQuizView
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-glow"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Final MCQ Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loadingStage1 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 glass-card rounded-3xl">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300 animate-pulse">
            Loading {level} level sub-topics with Gemini AI...
          </p>
        </div>
      ) : isFinalQuizView ? (
        /* FINAL STEP: SEPARATE FINAL TOPIC MASTERY QUIZ PAGE (5 TO 7 MCQS) */
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 shadow-emerald-glow text-white font-black flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Final Topic Mastery Quiz</h2>
                <p className="text-xs text-slate-300">5 to 7 MCQs covering all sub-topics of {selectedTopic}</p>
              </div>
            </div>
          </div>

          {loadingQuiz ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse">
                Generating 5 to 7 mastery quiz questions with Gemini AI...
              </p>
            </div>
          ) : finalQuizQuestions.length > 0 ? (
            <div className="space-y-6">
              {finalQuizQuestions.map((q, qIdx) => {
                const selectedOpt = userAnswers[q.id];
                return (
                  <div key={q.id} className="p-6 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black shrink-0 border border-emerald-500/30">
                        Q{qIdx + 1}
                      </span>
                      <h3 className="text-base font-semibold text-white leading-snug">{q.question}</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedOpt === optIdx;
                        const isCorrect = q.correctIndex === optIdx;

                        let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";
                        if (isSelected && !quizSubmitted) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-white shadow-emerald-glow font-semibold";
                        } else if (quizSubmitted) {
                          if (isCorrect) {
                            btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                          } else if (isSelected && !isCorrect) {
                            btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleOptionSelect(q.id, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${btnStyle}`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? "border-emerald-400 bg-emerald-500" : "border-slate-700 bg-slate-950"
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span>
                              <span className="font-bold mr-1.5 opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 ml-8 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                        <span className="font-bold text-emerald-400 block mb-1">Explanation feedback:</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!quizSubmitted ? (
                <button
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(userAnswers).length < finalQuizQuestions.length}
                  className="w-full emerald-button text-white py-4 rounded-xl font-extrabold text-sm shadow-emerald-glow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>Submit Quiz Answer » Unlock Topic Mastery Certificate</span>
                </button>
              ) : finalScorecard && (
                <div className="p-8 rounded-3xl bg-[#0B0F19] border border-emerald-500/50 text-center space-y-6 shadow-emerald-strong">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold block">
                      Topic Mastery Certificate & Analytics
                    </span>
                    <h3 className="text-4xl font-black text-white mt-1">
                      Topic Mastered ({finalScorecard.overallPercent}%)
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                      Quiz Score: {finalScorecard.mcqScore}% ({Math.round(finalQuizQuestions.length * (finalScorecard.mcqScore/100))}/{finalQuizQuestions.length} Correct)
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a
                      href="/profile"
                      className="w-full sm:w-auto emerald-button text-white px-8 py-3.5 rounded-xl text-xs font-bold shadow-emerald-glow inline-block"
                    >
                      View Profile & Heatmap →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : viewMode === "lesson" && currentSubTopic ? (
        /* SUB-TOPIC N LESSON CARD */
        <div className="glass-card p-8 rounded-3xl space-y-7">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Sub-Topic {activeSubIndex + 1} Lesson Card
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide">{currentSubTopic.title}</h2>
          </div>

          {/* 1. Concept Overview & Analogy */}
          <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Concept overview & real-world analogy
            </span>
            <p className="text-base text-slate-200 leading-relaxed">
              {currentSubTopic.overview}
            </p>
          </div>

          {/* 2. Detailed Mechanics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              In-depth mechanics & explanation ({level} level)
            </h3>
            <p className="text-base text-slate-200 leading-relaxed whitespace-pre-line">
              {currentSubTopic.detailedExplanation}
            </p>
          </div>

          {/* 3. Key Rules */}
          {currentSubTopic.keyRules && currentSubTopic.keyRules.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-teal-400" />
                Key rules & execution steps
              </h3>
              <div className="space-y-2">
                {currentSubTopic.keyRules.map((rule, rIdx) => (
                  <div key={rIdx} className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-sm text-slate-200 flex items-start gap-2.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Code Syntax Block */}
          {currentSubTopic.codeExample && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-emerald-400" />
                  Code syntax block
                </span>
                <button
                  onClick={() => handleCopyCode(currentSubTopic.codeExample, currentSubTopicId)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedId === currentSubTopicId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-[#030712] border border-slate-800 text-emerald-300 text-xs overflow-x-auto font-mono">
                <pre>{currentSubTopic.codeExample}</pre>
              </div>
            </div>
          )}

          {/* Bottom Action Button: Go to Assessment */}
          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setViewMode("assessment")}
              className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center gap-2"
            >
              <span>Proceed to Sub-Topic {activeSubIndex + 1} Assessment (2 Questions)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : currentSubTopic ? (
        /* SUB-TOPIC N ASSESSMENT VIEW (2 QUESTIONS) */
        <div className="glass-card p-8 rounded-3xl space-y-7 border border-amber-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Sub-Topic {activeSubIndex + 1} Assessment
              </span>
              <h2 className="text-2xl font-bold text-white tracking-wide">{currentSubTopic.title}</h2>
            </div>

            {currentSubState.evaluation && (
              <div className="px-4 py-2 rounded-2xl bg-[#0B0F19] border border-amber-500/40 text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-xl font-black text-amber-400">
                  {currentSubState.evaluation.score} / 2.0
                </div>
              </div>
            )}
          </div>

          {/* Question 1 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-amber-300 leading-snug block">
              Question 1: {currentSubTopic.question1 || `Explain the core purpose and execution rules of ${currentSubTopic.title}.`}
            </label>
            <textarea
              rows={3}
              value={currentSubState.answer1}
              onChange={(e) => {
                const val = e.target.value;
                setSubAssessments((prev) => ({
                  ...prev,
                  [currentSubTopicId]: { ...prev[currentSubTopicId], answer1: val },
                }));
              }}
              placeholder="Type your technical explanation for Question 1..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-amber-300 leading-snug block">
              Question 2: {currentSubTopic.question2 || `What happens during edge cases or invalid input evaluation in ${currentSubTopic.title}?`}
            </label>
            <textarea
              rows={3}
              value={currentSubState.answer2}
              onChange={(e) => {
                const val = e.target.value;
                setSubAssessments((prev) => ({
                  ...prev,
                  [currentSubTopicId]: { ...prev[currentSubTopicId], answer2: val },
                }));
              }}
              placeholder="Type your technical explanation for Question 2..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSubTopicAssessmentSubmit(currentSubTopicId, currentSubTopic.title)}
            disabled={currentSubState.isEvaluating || (!currentSubState.answer1.trim() && !currentSubState.answer2.trim())}
            className="emerald-button text-white px-7 py-3 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {currentSubState.isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating answers...
              </>
            ) : (
              <>
                <span>Submit Answers for Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Evaluation Readout */}
          {currentSubState.evaluation && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Missing key technical terms
                </span>
                <div className="space-y-2">
                  {currentSubState.evaluation.missingPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-medium flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {currentSubState.evaluation.targetedReTeaching.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Targeted re-teaching explanation
                  </span>
                  <div className="space-y-2">
                    {currentSubState.evaluation.targetedReTeaching.map((re, rIdx) => (
                      <div key={rIdx} className="p-3.5 rounded-xl bg-[#0B0F19] border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                        {re}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setViewMode("lesson")}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sub-Topic {activeSubIndex + 1} Lesson</span>
            </button>

            <button
              onClick={() => {
                if (activeSubIndex < totalSubTopics - 1) {
                  setActiveSubIndex(activeSubIndex + 1);
                  setViewMode("lesson");
                } else {
                  fetchFinalQuiz();
                  setActiveSubIndex(totalSubTopics);
                }
              }}
              className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center gap-2"
            >
              <span>
                {activeSubIndex < totalSubTopics - 1
                  ? `Proceed to Sub-Topic ${activeSubIndex + 2} Lesson →`
                  : `Proceed to Final Topic MCQ Quiz →`}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
