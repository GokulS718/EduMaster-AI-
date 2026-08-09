"use client";

import React, { useState, useEffect } from "react";
import { useLearning, KnowledgeLevel, SubTopicLesson, MCQQuestion } from "@/context/LearningContext";
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2,
  ShieldCheck,
  Code,
  Copy,
  Check,
  FileCode2,
  HelpCircle,
  ChevronDown
} from "lucide-react";

interface SubTopicState {
  studentAnswer: string;
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

  const [loadingStage1, setLoadingStage1] = useState<boolean>(false);
  const [subTopicStates, setSubTopicStates] = useState<Record<string, SubTopicState>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Final Stage Quiz State
  const [finalQuizQuestions, setFinalQuizQuestions] = useState<MCQQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [finalScorecard, setFinalScorecard] = useState<{
    mcqScore: number;
    overallPercent: number;
  } | null>(null);

  // Fetch Stage 1 Sub-Topics
  const fetchStage1Data = async () => {
    if (!selectedTopic.trim()) return;
    setLoadingStage1(true);
    try {
      const res = await fetch("/api/step1-teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, level }),
      });
      const data = await res.json();
      if (data.subTopics && Array.isArray(data.subTopics)) {
        setSubTopics(data.subTopics);
        
        // Initialize state for each sub-topic section
        const initialStates: Record<string, SubTopicState> = {};
        data.subTopics.forEach((st: SubTopicLesson) => {
          initialStates[st.id] = {
            studentAnswer: "",
            isEvaluating: false,
            evaluation: null,
          };
        });
        setSubTopicStates(initialStates);
      }
    } catch (err) {
      console.error("Stage 1 fetch error:", err);
    } finally {
      setLoadingStage1(false);
    }
  };

  // Trigger Stage 1 fetch on load if empty
  useEffect(() => {
    if (subTopics.length === 0 && selectedTopic) {
      fetchStage1Data();
    } else if (subTopics.length > 0 && Object.keys(subTopicStates).length === 0) {
      const initialStates: Record<string, SubTopicState> = {};
      subTopics.forEach((st) => {
        initialStates[st.id] = {
          studentAnswer: "",
          isEvaluating: false,
          evaluation: null,
        };
      });
      setSubTopicStates(initialStates);
    }
  }, [selectedTopic, level]);

  // Copy Code Helper
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Individual Sub-Topic 2-Mark Question Submit
  const handleSubTopicSubmit = async (subTopicId: string, subTopicTitle: string) => {
    const currentState = subTopicStates[subTopicId];
    if (!currentState || !currentState.studentAnswer.trim()) return;

    setSubTopicStates((prev) => ({
      ...prev,
      [subTopicId]: { ...prev[subTopicId], isEvaluating: true },
    }));

    try {
      const res = await fetch("/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `${selectedTopic} - ${subTopicTitle}`,
          studentAnswer: currentState.studentAnswer,
          level,
        }),
      });
      const data = await res.json();
      
      setSubTopicStates((prev) => ({
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

      // Store quiz questions if returned
      if (data.masteryQuiz && Array.isArray(data.masteryQuiz) && finalQuizQuestions.length === 0) {
        setFinalQuizQuestions(data.masteryQuiz);
      }
    } catch (err) {
      console.error("Sub-topic evaluation error:", err);
      setSubTopicStates((prev) => ({
        ...prev,
        [subTopicId]: { ...prev[subTopicId], isEvaluating: false },
      }));
    }
  };

  // Fetch Final Quiz Questions if not loaded yet
  const fetchFinalQuiz = async () => {
    if (finalQuizQuestions.length > 0) return;
    setLoadingQuiz(true);
    try {
      const res = await fetch("/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          studentAnswer: "Summary topic mastery submission for final quiz generation.",
          level,
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

  // Trigger final quiz load when all sub-topics evaluated or user scrolls to bottom
  useEffect(() => {
    const evaluatedCount = Object.values(subTopicStates).filter((s) => s.evaluation !== null).length;
    if (subTopics.length > 0 && evaluatedCount >= 1 && finalQuizQuestions.length === 0) {
      fetchFinalQuiz();
    }
  }, [subTopicStates]);

  // Handle Final Quiz MCQ Option Select
  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Submit Final Quiz
  const handleQuizSubmit = () => {
    if (finalQuizQuestions.length === 0) return;
    let correctCount = 0;
    finalQuizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const mcqPercent = Math.round((correctCount / finalQuizQuestions.length) * 100);
    const evaluatedScores = Object.values(subTopicStates)
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
      missingPointsReviewed: ["Sub-topic definitions & syntax rules", "Contention & execution mechanics"],
    });
  };

  const getLevelBadge = (lvl: KnowledgeLevel) => {
    if (lvl === "Beginner") return "bg-amber-500/20 text-amber-400 border-amber-500/40";
    if (lvl === "Intermediate") return "bg-violet-500/20 text-violet-400 border-violet-500/40";
    return "bg-rose-500/20 text-rose-400 border-rose-500/40";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Controls Banner */}
      <div className="glass-card p-8 rounded-3xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Single-Page Scrolling Learning Feed
            </div>
            <h1 className="text-3xl font-black text-white">{selectedTopic}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${getLevelBadge(level)}`}>
              Level: {level}
            </span>
            <button
              onClick={fetchStage1Data}
              disabled={loadingStage1}
              className="p-2.5 text-slate-300 hover:text-white bg-slate-950 rounded-xl border border-slate-800 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCcw className={`w-4 h-4 ${loadingStage1 ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300">
          Scroll down through each sub-topic section to read lessons, inspect syntax code snippets, and complete 2-mark evaluation questions.
        </p>
      </div>

      {loadingStage1 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 glass-card rounded-3xl">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300 animate-pulse">
            Generating sub-topic sections & 2-mark questions with Gemini AI...
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* STACKED SUB-TOPIC SECTIONS (SINGLE-PAGE SCROLLING FEED) */}
          {subTopics.map((st, idx) => {
            const state = subTopicStates[st.id] || {
              studentAnswer: "",
              isEvaluating: false,
              evaluation: null,
            };

            return (
              <section key={st.id} className="space-y-6 scroll-mt-20" id={st.id}>
                {/* Section Header */}
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs border border-emerald-500/30">
                    {idx + 1}
                  </div>
                  <h2 className="text-xl font-bold text-white">SUB-TOPIC {idx + 1}: {st.title}</h2>
                </div>

                {/* Deep Teaching Card */}
                <div className="glass-card p-7 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" /> Sub-Topic Lesson Card
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {st.content}
                  </p>

                  {/* Language-Matched Code Block with Copy Code Button */}
                  {st.codeExample && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                          Code Syntax Block ({st.codeLanguage || "code"})
                        </span>
                        <button
                          onClick={() => handleCopyCode(st.codeExample!, st.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          {copiedId === st.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#030712] border border-slate-800 text-emerald-300 text-xs overflow-x-auto font-mono">
                        <pre>{st.codeExample}</pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2-Mark Question & Answer Card */}
                <div className="glass-card p-7 rounded-3xl space-y-5 border border-emerald-500/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> 2-Mark University Mock Question
                      </span>
                      <h3 className="text-base font-bold text-white leading-snug">
                        "{st.question || `Explain the core principles and execution mechanics of ${st.title}.`}"
                      </h3>
                    </div>

                    {state.evaluation && (
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                        <div className="text-lg font-black text-amber-400">
                          {state.evaluation.score} / 2.0
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Written Answer Form */}
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      value={state.studentAnswer}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSubTopicStates((prev) => ({
                          ...prev,
                          [st.id]: { ...prev[st.id], studentAnswer: val },
                        }));
                      }}
                      placeholder="Type your technical answer here (write at least 1-2 complete sentences covering definitions and mechanics)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />

                    <button
                      onClick={() => handleSubTopicSubmit(st.id, st.title)}
                      disabled={state.isEvaluating || !state.studentAnswer.trim()}
                      className="emerald-button text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {state.isEvaluating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Evaluating Answer...
                        </>
                      ) : (
                        <>
                          <span>Submit Answer for Evaluation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Evaluation Readout */}
                  {state.evaluation && (
                    <div className="pt-4 border-t border-slate-800 space-y-4">
                      {/* Missing Points */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing Key Technical Terms
                        </span>
                        <div className="space-y-1.5">
                          {state.evaluation.missingPoints.map((pt, pIdx) => (
                            <div key={pIdx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-medium flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Targeted Re-Teaching */}
                      {state.evaluation.targetedReTeaching.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Targeted Re-Teaching Explanation
                          </span>
                          <div className="space-y-2">
                            {state.evaluation.targetedReTeaching.map((re, rIdx) => (
                              <div key={rIdx} className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                                {re}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {/* FINAL TOPIC MASTERY QUIZ (5 TO 7 MCQS) */}
          <section className="pt-8 border-t-2 border-slate-800 space-y-8" id="final-quiz">
            <div className="glass-card p-8 rounded-3xl space-y-8">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 shadow-emerald-glow text-white font-black flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">FINAL TOPIC MASTERY QUIZ</h2>
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
                      <div key={q.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black shrink-0 border border-emerald-500/30">
                            Q{qIdx + 1}
                          </span>
                          <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                        </div>

                        {/* Options with Radio Buttons */}
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

                        {/* Instant Feedback Explanation */}
                        {quizSubmitted && (
                          <div className="mt-3 ml-8 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                            <span className="font-bold text-emerald-400 block mb-1">Explanation Feedback:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Submit Button */}
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(userAnswers).length < finalQuizQuestions.length}
                      className="w-full emerald-button text-white py-4 rounded-xl font-extrabold text-sm shadow-emerald-glow disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>Submit Answer » Unlock Topic Mastery Badge</span>
                    </button>
                  ) : finalScorecard && (
                    <div className="p-8 rounded-3xl bg-slate-950 border border-emerald-500/50 text-center space-y-6 shadow-emerald-strong">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400">
                        <ShieldCheck className="w-8 h-8" />
                      </div>

                      <div>
                        <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold block">
                          Topic Mastery Badge
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
          </section>
        </div>
      )}
    </div>
  );
}
