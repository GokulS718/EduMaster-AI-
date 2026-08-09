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
  ChevronRight,
  ShieldCheck,
  Code,
  CheckCircle,
  HelpCircle,
  FileCode2
} from "lucide-react";

export default function EnginePage() {
  const {
    selectedTopic,
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
    addCompletedTopic,
  } = useLearning();

  // Stage 1 State: Active Sub-topic selection
  const [activeSubTopicId, setActiveSubTopicId] = useState<string>("");
  const [loadingStage1, setLoadingStage1] = useState<boolean>(false);

  // Stage 2 State: Mock Question Answer Textarea
  const [studentAnswer, setStudentAnswer] = useState<string>("");
  const [loadingStage2, setLoadingStage2] = useState<boolean>(false);

  // Stage 3 MCQ Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [finalScorecard, setFinalScorecard] = useState<{
    mcqScore: number;
    overallPercent: number;
  } | null>(null);

  // Fetch Stage 1 Sub-Topics and 2-Mark Question
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
        if (data.subTopics.length > 0) {
          setActiveSubTopicId(data.subTopics[0].id);
        }
      }
      if (data.twoMarkQuestion) {
        setTwoMarkQuestion(data.twoMarkQuestion);
      }
    } catch (err) {
      console.error("Stage 1 fetch error:", err);
    } finally {
      setLoadingStage1(false);
    }
  };

  // Trigger Stage 1 fetch on load if subTopics is empty
  useEffect(() => {
    if (subTopics.length === 0 && selectedTopic) {
      fetchStage1Data();
    } else if (subTopics.length > 0 && !activeSubTopicId) {
      setActiveSubTopicId(subTopics[0].id);
    }
  }, [selectedTopic, level]);

  // Submit Stage 2 Written Answer for Evaluation
  const handleStage2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;
    setLoadingStage2(true);
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
      console.error("Stage 2 evaluation error:", err);
    } finally {
      setLoadingStage2(false);
    }
  };

  // Handle MCQ Selection in Stage 3
  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  // Submit Final Stage 3 MCQ Quiz
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
    const step2Percent = (step2Evaluation.score / step2Evaluation.maxScore) * 100;
    const overallPercent = Math.round(step2Percent * 0.4 + mcqPercent * 0.6);

    setQuizSubmitted(true);
    setFinalScorecard({
      mcqScore: mcqPercent,
      overallPercent,
    });

    // Record into profile analytics history
    addCompletedTopic({
      topic: selectedTopic,
      level,
      step2Score: step2Evaluation.score,
      quizScore: mcqPercent,
      overallMasteryScore: overallPercent,
      missingPointsReviewed: step2Evaluation.missingPoints,
    });
  };

  const currentSubTopic = subTopics.find((st) => st.id === activeSubTopicId) || subTopics[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Stepper Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> 3-Stage Adaptive Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {selectedTopic}
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 font-semibold">Knowledge Level:</span>
            <select
              value={level}
              onChange={(e) => {
                const newLevel = e.target.value as KnowledgeLevel;
                setLevel(newLevel);
                setSubTopics([]);
                setStep2Evaluation(null);
              }}
              className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none cursor-pointer"
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
            { step: 1, title: "STAGE 1: Sub-Topics Teaching", icon: Code },
            { step: 2, title: "STAGE 2: 2-Mark Mock Question", icon: Target },
            { step: 3, title: "STAGE 3: 5–7 MCQ Quiz", icon: Award },
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
                disabled={item.step > 1 && !step2Evaluation && activeStep < item.step}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition ${
                  isCurrent
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-emerald-glow"
                    : isCompleted
                    ? "bg-slate-900 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">{item.title}</span>
                <span className="sm:hidden">Stage {item.step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: Sub-Topics Breakdown & Teaching Cards */}
      {activeStep === 1 && (
        <div className="glass-card p-8 rounded-3xl border border-slate-700/80 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-black">
                1
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STAGE 1: Sub-Topics Breakdown & Teaching</h2>
                <p className="text-xs text-slate-300">
                  Select a sub-topic to review concise lessons & syntax code blocks
                </p>
              </div>
            </div>
            <button
              onClick={fetchStage1Data}
              disabled={loadingStage1}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-xl border border-slate-700 transition"
              title="Regenerate Sub-Topics"
            >
              <RotateCcw className={`w-4 h-4 ${loadingStage1 ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>

          {loadingStage1 ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm text-slate-300 animate-pulse">
                Generating 4–5 core sub-topics and code examples with Gemini AI...
              </p>
            </div>
          ) : subTopics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sub-topics Sidebar / Tabs */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 block mb-2">
                  Sub-Topics ({subTopics.length})
                </span>
                {subTopics.map((st, idx) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveSubTopicId(st.id)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition flex items-center justify-between ${
                      activeSubTopicId === st.id
                        ? "bg-slate-750 border-emerald-500 text-white shadow-emerald-glow"
                        : "bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 line-clamp-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{st.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${activeSubTopicId === st.id ? "text-emerald-400" : "text-slate-500"}`} />
                  </button>
                ))}
              </div>

              {/* Right Sub-Topic Teaching Content & Code Card */}
              <div className="lg:col-span-8 space-y-6">
                {currentSubTopic && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileCode2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-bold text-white">{currentSubTopic.title}</h3>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">
                      {currentSubTopic.content}
                    </p>

                    {/* Syntax Code Example Block */}
                    {currentSubTopic.codeExample && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Syntax / Code Example
                        </span>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs overflow-x-auto">
                          <pre>{currentSubTopic.codeExample}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ready to Move to Stage 2 Box */}
              <div className="lg:col-span-12 pt-6 border-t border-slate-700/80 space-y-4">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700/80 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Stage 2 Exam Question (2 Marks)
                  </span>
                  <p className="text-sm font-bold text-white">
                    "{twoMarkQuestion || `Explain the core principles and operational mechanisms of ${selectedTopic}.`}"
                  </p>
                </div>

                <form onSubmit={handleStage2Submit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Your Written Answer
                    </label>
                    <textarea
                      rows={4}
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                      placeholder="Type your technical written answer here (e.g. explain key definitions, syntax differences, or operational constraints)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loadingStage2 || !studentAnswer.trim()}
                    className="w-full emerald-button text-white py-3.5 rounded-xl font-bold text-sm shadow-emerald-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loadingStage2 ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating Written Answer with AI...
                      </>
                    ) : (
                      <>
                        <span>Submit Answer for Stage 2 Evaluation & Re-Teaching</span>
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

      {/* STAGE 2: 2-Mark Mock Question Evaluation & Re-Teaching */}
      {activeStep === 2 && step2Evaluation && (
        <div className="glass-card p-8 rounded-3xl border border-slate-700/80 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STAGE 2: Mock Answer Evaluation & Re-Teaching</h2>
                <p className="text-xs text-slate-300">Detailed scoring, missing technical terms, and targeted explanation</p>
              </div>
            </div>

            {/* Score Badge */}
            <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Mock Score</div>
              <div className="text-xl font-black text-amber-400">
                {step2Evaluation.score} <span className="text-xs text-slate-400 font-medium">/ 2.0 Marks</span>
              </div>
            </div>
          </div>

          {/* Missing Points Box */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Key Technical Terms
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

          {/* Targeted Re-Teaching Explanation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Targeted Re-Teaching Explanation
            </h3>
            <div className="space-y-3">
              {step2Evaluation.targetedReTeaching.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-start gap-3.5"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-emerald-glow">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Move to Stage 3 Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setActiveStep(3)}
              className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-emerald-glow flex items-center gap-2"
            >
              <span>Proceed to Stage 3: 5–7 MCQ Mastery Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: 5 to 7 MCQ Mastery Quiz */}
      {activeStep === 3 && step2Evaluation && (
        <div className="glass-card p-8 rounded-3xl border border-slate-700/80 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                3
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">STAGE 3: Final Mastery Quiz ({step2Evaluation.masteryQuiz.length} Questions)</h2>
                <p className="text-xs text-slate-300">Multiple choice questions covering all sub-topics</p>
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
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
                  </div>

                  {/* Options with Rounded Radio Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600";
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
                            isSelected ? "border-emerald-400 bg-emerald-500" : "border-slate-600 bg-slate-900"
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

                  {/* Instant Explanation Feedback */}
                  {quizSubmitted && (
                    <div className="mt-3 ml-8 p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 leading-relaxed">
                      <span className="font-bold text-emerald-400 block mb-1">Explanation Feedback:</span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz Button */}
          {!quizSubmitted ? (
            <button
              onClick={handleQuizSubmit}
              disabled={Object.keys(userAnswers).length < step2Evaluation.masteryQuiz.length}
              className="w-full emerald-button text-white py-4 rounded-xl font-extrabold text-sm shadow-emerald-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>Submit Answer » Unlock Topic Mastery Scorecard</span>
            </button>
          ) : finalScorecard && (
            <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/50 text-center space-y-6 shadow-emerald-strong">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold block">
                  Topic Mastery Scorecard
                </span>
                <h3 className="text-4xl font-black text-white mt-1">
                  {finalScorecard.overallPercent}% — Topic Mastered!
                </h3>
                <p className="text-xs text-slate-300 mt-2">
                  Stage 2 Score: {step2Evaluation.score}/2.0 • Quiz Score: {finalScorecard.mcqScore}% ({Math.round(step2Evaluation.masteryQuiz.length * (finalScorecard.mcqScore/100))}/{step2Evaluation.masteryQuiz.length} Correct)
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setActiveStep(1)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Review Sub-Topics Again
                </button>
                <a
                  href="/profile"
                  className="w-full sm:w-auto emerald-button text-white px-8 py-3 rounded-xl text-xs font-bold shadow-emerald-glow inline-block"
                >
                  View Profile & Activity Heatmap →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
