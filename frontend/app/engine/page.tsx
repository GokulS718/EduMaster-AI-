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
  Layers,
  GraduationCap,
  FileText
} from "lucide-react";

interface EvaluationResult {
  score: number;
  maxScore: number;
  missingPoints: string[];
  targetedReTeaching: string[];
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

  // 3-PAGE W3SCHOOLS-STYLE FLOW
  // Page 1: Sub-Topic Detailed Study View (with Easy | Intermediate | Advanced Level Switcher)
  // Page 2: Two (2) 2-Mark University Questions Page (Section A Gap Analysis)
  // Page 3: Separate Final MCQ Quiz Page (Section B Final Mastery Analysis & Database Persistence)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeSubIndex, setActiveSubIndex] = useState<number>(0);

  const [loadingStage1, setLoadingStage1] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Page 2 State: Two 2-mark questions
  const [answer1, setAnswer1] = useState<string>("");
  const [answer2, setAnswer2] = useState<string>("");
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);

  // Page 3 State: Final MCQ Quiz
  const [finalQuizQuestions, setFinalQuizQuestions] = useState<MCQQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [finalScorecard, setFinalScorecard] = useState<{
    mcqScore: number;
    overallPercent: number;
  } | null>(null);

  // Fetch Stage 1 Sub-Topics from Decoupled Backend Port 8080
  const fetchStage1Data = async (targetLevel: KnowledgeLevel = level) => {
    if (!selectedTopic.trim()) return;
    setLoadingStage1(true);
    setCurrentPage(1);
    setActiveSubIndex(0);
    setEvalResult(null);
    try {
      const res = await fetch("http://localhost:8080/api/step1-teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, level: targetLevel }),
      });
      const data = await res.json();
      if (data.subTopics && Array.isArray(data.subTopics)) {
        setSubTopics(data.subTopics);
      }
    } catch (err) {
      console.error("Stage 1 fetch error from Port 8080:", err);
    } finally {
      setLoadingStage1(false);
    }
  };

  useEffect(() => {
    if (subTopics.length === 0 && selectedTopic) {
      fetchStage1Data();
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

  // Submit Section A Answers to Spring Boot Backend Port 8080
  const handleSectionASubmit = async () => {
    if (!answer1.trim() && !answer2.trim()) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("http://localhost:8080/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          level,
          answer1,
          answer2,
          studentAnswer: `${answer1} ${answer2}`.trim(),
        }),
      });
      const data = await res.json();
      
      setEvalResult({
        score: data.score,
        maxScore: data.maxScore || 2.0,
        missingPoints: data.missingPoints || [],
        targetedReTeaching: data.targetedReTeaching || [],
      });

      if (data.masteryQuiz && Array.isArray(data.masteryQuiz)) {
        setFinalQuizQuestions(data.masteryQuiz);
      }
    } catch (err) {
      console.error("Section A evaluation error from Port 8080:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const fetchFinalQuiz = async () => {
    if (finalQuizQuestions.length > 0) return;
    setLoadingQuiz(true);
    try {
      const res = await fetch("http://localhost:8080/api/step2-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic,
          level,
          answer1: "Summary exam evaluation request for section B quiz",
          answer2: "Full topic assessment",
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
    const secAScore = evalResult?.score || 1.5;
    const step2Percent = (secAScore / 2.0) * 100;
    const overallPercent = Math.round(step2Percent * 0.4 + mcqPercent * 0.6);

    setQuizSubmitted(true);
    setFinalScorecard({
      mcqScore: mcqPercent,
      overallPercent,
    });

    addCompletedTopic({
      topic: selectedTopic,
      level,
      step2Score: secAScore,
      quizScore: mcqPercent,
      overallMasteryScore: overallPercent,
      missingPointsReviewed: evalResult?.missingPoints || ["Core definitions", "Key mechanics"],
    });
  };

  const currentSubTopic: SubTopicLesson | undefined = subTopics[activeSubIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Dynamic Level Switcher */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              <GraduationCap className="w-3.5 h-3.5" /> Spring Boot + Next.js Decoupled Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
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

        {/* 3-Page Flow Navigator */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                currentPage === 1
                  ? "bg-emerald-500/20 border border-emerald-500 text-white shadow-emerald-glow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Page 1: Sub-Topic Study</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

            <button
              onClick={() => setCurrentPage(2)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                currentPage === 2
                  ? "bg-amber-500/20 border border-amber-500 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Page 2: 2-Mark Questions (Section A)</span>
            </button>

            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />

            <button
              onClick={() => {
                fetchFinalQuiz();
                setCurrentPage(3);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 ${
                currentPage === 3
                  ? "bg-emerald-600 border border-emerald-400 text-white shadow-emerald-glow"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Page 3: Final MCQ Quiz (Section B)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Views */}
      {loadingStage1 ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 glass-card rounded-3xl">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-sm font-bold text-slate-300 animate-pulse">
            Fetching {level} lessons from Java Spring Boot REST API (Port 8080)...
          </p>
        </div>
      ) : currentPage === 1 ? (
        /* PAGE 1: SUB-TOPIC DETAILED STUDY VIEW */
        <div className="space-y-6">
          {/* Sub-Topic Selection Pills */}
          {subTopics.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#141E2E] rounded-2xl border border-slate-800">
              {subTopics.map((st, idx) => (
                <button
                  key={st.id || idx}
                  onClick={() => setActiveSubIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                    activeSubIndex === idx
                      ? "bg-emerald-600 text-white shadow-emerald-glow"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-300 text-[10px] flex items-center justify-center font-extrabold">
                    {idx + 1}
                  </span>
                  <span>{st.title}</span>
                </button>
              ))}
            </div>
          )}

          {currentSubTopic && (
            <div className="glass-card p-8 rounded-3xl space-y-7">
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" /> Sub-Topic {activeSubIndex + 1} Detailed Study View
                </div>
                <h2 className="text-2xl font-black text-white">{currentSubTopic.title}</h2>
              </div>

              {/* Overview & Analogy */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                  Concept Overview & Analogy
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {currentSubTopic.overview}
                </p>
              </div>

              {/* Detailed Mechanics */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  In-Depth Mechanics & University Explanation
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-line">
                  {currentSubTopic.detailedExplanation}
                </p>
              </div>

              {/* Key Rules */}
              {currentSubTopic.keyRules && currentSubTopic.keyRules.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-teal-400" />
                    Key Execution Rules & Requirements
                  </h3>
                  <div className="space-y-2">
                    {currentSubTopic.keyRules.map((rule, rIdx) => (
                      <div key={rIdx} className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Syntax Code Block */}
              {currentSubTopic.codeExample && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileCode2 className="w-4 h-4 text-emerald-400" />
                      Runnable Code Syntax Block
                    </span>
                    <button
                      onClick={() => handleCopyCode(currentSubTopic.codeExample, currentSubTopic.id || activeSubIndex + 1)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedId === (currentSubTopic.id || activeSubIndex + 1) ? (
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
                  <div className="p-5 rounded-2xl bg-[#030712] border border-slate-800 text-emerald-300 text-xs overflow-x-auto font-mono">
                    <pre>{currentSubTopic.codeExample}</pre>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                <button
                  disabled={activeSubIndex === 0}
                  onClick={() => setActiveSubIndex(activeSubIndex - 1)}
                  className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold disabled:opacity-40 transition"
                >
                  ← Previous Sub-Topic
                </button>

                {activeSubIndex < subTopics.length - 1 ? (
                  <button
                    onClick={() => setActiveSubIndex(activeSubIndex + 1)}
                    className="emerald-button text-white px-7 py-3 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center gap-2"
                  >
                    <span>Next Sub-Topic ({activeSubIndex + 2}/{subTopics.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentPage(2)}
                    className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center gap-2"
                  >
                    <span>Proceed to Section A Exam Assessment (2 Questions)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : currentPage === 2 ? (
        /* PAGE 2: TWO (2) 2-MARK UNIVERSITY QUESTIONS PAGE (SECTION A GAP ANALYSIS) */
        <div className="glass-card p-8 rounded-3xl space-y-7 border border-amber-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Section A: 2-Mark Exam Assessment
              </span>
              <h2 className="text-2xl font-black text-white">{selectedTopic}</h2>
            </div>

            {evalResult && (
              <div className="px-4 py-2 rounded-2xl bg-[#0B0F19] border border-amber-500/40 text-right shrink-0">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                <div className="text-xl font-black text-amber-400">
                  {evalResult.score} / 2.0
                </div>
              </div>
            )}
          </div>

          {/* Question 1 Input */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Question 1: Explain the core execution mechanics and rules of {subTopics[0]?.title || selectedTopic}.
            </label>
            <textarea
              rows={3}
              value={answer1}
              onChange={(e) => setAnswer1(e.target.value)}
              placeholder="Write your technical explanation for Question 1..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Question 2 Input */}
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              Question 2: What are the performance trade-offs, edge cases, and invariants for {subTopics[1]?.title || selectedTopic}?
            </label>
            <textarea
              rows={3}
              value={answer2}
              onChange={(e) => setAnswer2(e.target.value)}
              placeholder="Write your technical explanation for Question 2..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSectionASubmit}
            disabled={isEvaluating || (!answer1.trim() && !answer2.trim())}
            className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating via Spring Boot API (Port 8080)...
              </>
            ) : (
              <>
                <span>Submit Section A Answers for Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Section A Gap Analysis Readout */}
          {evalResult && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Section A Gap Analysis (Missing Key Terms)
                </span>
                <div className="space-y-2">
                  {evalResult.missingPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 font-medium flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {evalResult.targetedReTeaching.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Targeted Re-Teaching Explanation
                  </span>
                  <div className="space-y-2">
                    {evalResult.targetedReTeaching.map((re, rIdx) => (
                      <div key={rIdx} className="p-3.5 rounded-xl bg-[#0B0F19] border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-medium">
                        {re}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button: Proceed to Page 3 */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Page 1 Lessons</span>
            </button>

            <button
              onClick={() => {
                fetchFinalQuiz();
                setCurrentPage(3);
              }}
              className="emerald-button text-white px-8 py-3.5 rounded-xl font-bold text-xs shadow-emerald-glow flex items-center gap-2"
            >
              <span>Proceed to Section B Final MCQ Quiz →</span>
            </button>
          </div>
        </div>
      ) : (
        /* PAGE 3: SEPARATE FINAL MCQ QUIZ PAGE (SECTION B FINAL MASTERY ANALYSIS & DATABASE PERSISTENCE) */
        <div className="glass-card p-8 rounded-3xl space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 shadow-emerald-glow text-white font-black flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">SECTION B: FINAL TOPIC MASTERY QUIZ</h2>
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
                      <h3 className="text-sm font-bold text-white leading-snug">{q.question}</h3>
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
                        <span className="font-bold text-emerald-400 block mb-1">Explanation Feedback:</span>
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
                  <span>Submit Quiz Answer » Section B Final Mastery Analysis & PostgreSQL Sync</span>
                </button>
              ) : finalScorecard && (
                <div className="p-8 rounded-3xl bg-[#0B0F19] border border-emerald-500/50 text-center space-y-6 shadow-emerald-strong">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold block">
                      Section B Final Mastery Analysis & Certificate
                    </span>
                    <h3 className="text-4xl font-black text-white mt-1">
                      Topic Mastered ({finalScorecard.overallPercent}%)
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                      Quiz Score: {finalScorecard.mcqScore}% ({Math.round(finalQuizQuestions.length * (finalScorecard.mcqScore/100))}/{finalQuizQuestions.length} Correct) • Saved to PostgreSQL DB
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
      )}
    </div>
  );
}
