"use client";

import React, { useState, useEffect } from "react";
import { useLearning, KnowledgeLevel, MCQQuestion } from "@/context/LearningContext";
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  Loader2,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function EnginePage() {
  const {
    selectedTopic,
    setSelectedTopic,
    level,
    setLevel,
    activeStep,
    setActiveStep,
    step1Lesson,
    setStep1Lesson,
    step2Evaluation,
    setStep2Evaluation,
    addCompletedTopic,
  } = useLearning();

  // Step 1 State
  const [loadingStep1, setLoadingStep1] = useState(false);

  // Step 2 State
  const [studentAnswer, setStudentAnswer] = useState("");
  const [loadingStep2, setLoadingStep2] = useState(false);

  // Step 3 MCQ Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [finalScorecard, setFinalScorecard] = useState<{
    mcqScore: number;
    overallPercent: number;
  } | null>(null);

  // Handle Step 1 Teaching Fetch
  const fetchStep1Lesson = async () => {
    if (!selectedTopic.trim()) return;
    setLoadingStep1(true);
    try {
      const res = await fetch("/api/step1-teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, level }),
      });
      const data = await res.json();
      if (data.initialLesson) {
        setStep1Lesson(data.initialLesson);
      }
    } catch (err) {
      console.error("Step 1 fetch error:", err);
    } finally {
      setLoadingStep1(false);
    }
  };

  // Trigger Step 1 fetch on load if lesson is null
  useEffect(() => {
    if (!step1Lesson && selectedTopic) {
      fetchStep1Lesson();
    }
  }, [selectedTopic, level]);

  // Handle Step 2 Evaluation Fetch
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;
    setLoadingStep2(true);
    try {
      const res = await fetch("/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          studentAnswer,
          level,
        }),
      });
      const data = await res.json();
      setStep2Evaluation(data);
      setActiveStep(2);
    } catch (err) {
      console.error("Step 2 evaluation error:", err);
    } finally {
      setLoadingStep2(false);
    }
  };

  // Handle MCQ Option Selection
  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Submit Final MCQ Quiz (Step 3)
  const handleQuizSubmit = () => {
    if (!step2Evaluation) return;
    const questions = step2Evaluation.masteryQuiz;
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const mcqPercent = Math.round((correctCount / questions.length) * 100);
    // Overall score = (Step 2 score / 2.0 * 40%) + (MCQ percent * 60%)
    const step2Percent = (step2Evaluation.score / step2Evaluation.maxScore) * 100;
    const overallPercent = Math.round(step2Percent * 0.4 + mcqPercent * 0.6);

    setQuizSubmitted(true);
    setFinalScorecard({
      mcqScore: mcqPercent,
      overallPercent,
    });

    // Record into global student analytics history
    addCompletedTopic({
      topic: selectedTopic,
      level,
      step2Score: step2Evaluation.score,
      quizScore: mcqPercent,
      overallMasteryScore: overallPercent,
      missingPointsReviewed: step2Evaluation.missingPoints,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Engine Stepper Header */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-500/10 border border-electric-500/30 text-electric-400 text-xs font-semibold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> 3-Step Adaptive Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {selectedTopic}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Level:</span>
            <select
              value={level}
              onChange={(e) => {
                const newLevel = e.target.value as KnowledgeLevel;
                setLevel(newLevel);
                setStep1Lesson(null);
                setStep2Evaluation(null);
              }}
              className="bg-transparent text-xs font-bold text-electric-400 focus:outline-none cursor-pointer"
            >
              <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
              <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
              <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
            </select>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: 1, title: "1. Initial Lesson", icon: BookOpen },
            { step: 2, title: "2. Mock Evaluation", icon: Target },
            { step: 3, title: "3. Mastery Quiz", icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const isCompleted = activeStep > item.step;
            const isCurrent = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => {
                  if (item.step === 1) setActiveStep(1);
                  if (item.step === 2 && step2Evaluation) setActiveStep(2);
                  if (item.step === 3 && step2Evaluation) setActiveStep(3);
                }}
                disabled={item.step > 1 && !step2Evaluation}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                  isCurrent
                    ? "bg-electric-600/20 text-electric-300 border-electric-500 shadow-electric-glow"
                    : isCompleted
                    ? "bg-slate-900 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-900/50 text-slate-500 border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{item.title}</span>
                <span className="sm:hidden">Step {item.step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Initial Knowledge-Based Teaching */}
      {activeStep === 1 && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-extrabold">
                1
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STEP 1: Knowledge-Based Teaching</h2>
                <p className="text-xs text-slate-400">Concise 3-bullet intro lesson tailored for {level} level</p>
              </div>
            </div>
            <button
              onClick={fetchStep1Lesson}
              disabled={loadingStep1}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800"
              title="Regenerate Lesson"
            >
              <RotateCcw className={`w-4 h-4 ${loadingStep1 ? "animate-spin text-electric-400" : ""}`} />
            </button>
          </div>

          {loadingStep1 ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-electric-400 animate-spin" />
              <p className="text-sm text-slate-400 animate-pulse">
                Generating concise 3-bullet intro lesson with Gemini AI...
              </p>
            </div>
          ) : step1Lesson ? (
            <div className="space-y-4">
              <div className="space-y-3">
                {step1Lesson.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3.5 hover:border-slate-700 transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-electric-500/20 text-electric-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{bullet}</p>
                  </div>
                ))}
              </div>

              {/* Transition to Step 2 Mock Evaluation Form */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-electric-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Step 2 Mock Question (2 Marks)
                  </span>
                  <p className="text-sm font-semibold text-white">
                    "Explain the core mechanisms, operational constraints, and edge case failures in {selectedTopic}."
                  </p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Your Written Answer
                    </label>
                    <textarea
                      rows={4}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Type your technical answer here (e.g. explain atomic operations, semaphores, lock acquisition, or tree rotations)..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingStep2 || !studentAnswer.trim()}
                    className="w-full electric-button text-white py-3.5 rounded-xl font-bold text-sm shadow-electric-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingStep2 ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating Written Answer with AI...
                      </>
                    ) : (
                      <>
                        <span>Submit Answer for Evaluation & Re-Teaching</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* STEP 2: Mock Evaluation & Targeted Re-Teaching */}
      {activeStep === 2 && step2Evaluation && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-extrabold">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STEP 2: Evaluation & Re-Teaching</h2>
                <p className="text-xs text-slate-400">Scorecard, missing technical points, and targeted re-teaching</p>
              </div>
            </div>

            {/* Score Badge */}
            <div className="px-4 py-2 rounded-2xl bg-electric-600/20 border border-electric-500/40 text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mock Score</div>
              <div className="text-xl font-black text-electric-400">
                {step2Evaluation.score} <span className="text-xs text-slate-400 font-medium">/ 2.0 Marks</span>
              </div>
            </div>
          </div>

          {/* Missing Points Box */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Technical Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {step2Evaluation.missingPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-medium flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2-Bullet Targeted Re-Teaching Lesson */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-electric-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-electric-400" /> Targeted Re-Teaching Lesson
            </h3>
            <div className="space-y-3">
              {step2Evaluation.targetedReTeaching.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-electric-500/30 flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-electric-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-electric-glow">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Move to Step 3 Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setActiveStep(3)}
              className="electric-button text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-electric-glow flex items-center gap-2"
            >
              <span>Proceed to Step 3: Final MCQ Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Final Mastery Quiz & Scorecard */}
      {activeStep === 3 && step2Evaluation && (
        <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400 font-extrabold">
                3
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STEP 3: Final Mastery Quiz</h2>
                <p className="text-xs text-slate-400">3 Targeted MCQs based specifically on your missing points</p>
              </div>
            </div>
          </div>

          {/* MCQ Questions List */}
          <div className="space-y-6">
            {step2Evaluation.masteryQuiz.map((q, qIdx) => {
              const selectedOpt = userAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-electric-600/20 border border-electric-500/30 text-electric-400 text-xs font-extrabold shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = "bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700";
                      if (isSelected && !quizSubmitted) {
                        btnStyle = "bg-electric-600/20 border-electric-500 text-white shadow-electric-glow";
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
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition ${btnStyle}`}
                        >
                          <span className="font-bold mr-2 opacity-60">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {quizSubmitted && (
                    <div className="mt-3 ml-8 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-electric-400 block mb-1">Explanation:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz or Render Scorecard */}
          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(userAnswers).length < step2Evaluation.masteryQuiz.length}
              className="w-full electric-button text-white py-3.5 rounded-xl font-bold text-sm shadow-electric-glow disabled:opacity-50"
            >
              Submit Mastery Quiz & Unlock Scorecard
            </button>
          ) : finalScorecard && (
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-electric-500/40 text-center space-y-6 shadow-electric-strong">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-electric-500/20 border border-electric-400 text-electric-400">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-electric-400 font-extrabold block">
                  Topic Mastery Scorecard
                </span>
                <h3 className="text-4xl font-black text-white mt-1">
                  {finalScorecard.overallPercent}% — Topic Mastered!
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Step 2 Mock Score: {step2Evaluation.score}/2.0 • Quiz Score: {finalScorecard.mcqScore}%
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setActiveStep(1)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Review Lesson Again
                </button>
                <a
                  href="/profile"
                  className="w-full sm:w-auto electric-button text-white px-8 py-3 rounded-xl text-xs font-bold shadow-electric-glow inline-block"
                >
                  View Updated Profile & Heatmap →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
