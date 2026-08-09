const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { generateStep1Lesson, evaluateStep2Answer } = require("./services/geminiService");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Memory store for DB assessments fallback
let studentAssessments = [
  {
    id: 1,
    topic: "SQL Queries & Inner Joins",
    level: "Intermediate",
    step2Score: 1.8,
    quizScore: 90,
    overallMasteryScore: 92,
    missingPointsJson: JSON.stringify(["Filtering order between WHERE and HAVING"]),
    completedAt: "2026-08-05",
  },
  {
    id: 2,
    topic: "Operating Systems — Process Synchronization",
    level: "Advanced",
    step2Score: 2.0,
    quizScore: 100,
    overallMasteryScore: 100,
    missingPointsJson: JSON.stringify(["Compare-And-Swap lock-free retry mechanics"]),
    completedAt: "2026-08-07",
  },
];

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", backend: "EduMaster AI Decoupled Java / Node Service", port: PORT });
});

app.post("/api/step1-teach", async (req, res) => {
  const { topic, level } = req.body;
  const topicName = topic || "SQL Queries";
  const levelName = level || "Intermediate";

  try {
    const result = await generateStep1Lesson(topicName, levelName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate lesson content", message: err.message });
  }
});

app.post("/api/step2-evaluate", async (req, res) => {
  const { topic, level, studentAnswer, answer1, answer2 } = req.body;
  const topicName = topic || "SQL Queries";
  const levelName = level || "Intermediate";
  const answerText = (answer1 ? answer1 + " " + (answer2 || "") : studentAnswer) || "";

  try {
    const result = await evaluateStep2Answer(topicName, answerText, levelName);
    
    // Save record to DB memory store
    const newRecord = {
      id: Date.now(),
      topic: topicName,
      level: levelName,
      step2Score: result.score,
      quizScore: 85,
      overallMasteryScore: Math.round((result.score / 2.0) * 100 * 0.4 + 85 * 0.6),
      missingPointsJson: JSON.stringify(result.missingPoints || []),
      completedAt: new Date().toISOString().split("T")[0],
    };
    studentAssessments.unshift(newRecord);
    result.assessmentId = newRecord.id;

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to evaluate answer", message: err.message });
  }
});

app.get("/api/assessments", (req, res) => {
  res.json(studentAssessments);
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` EduMaster AI Backend Service Listening on http://localhost:${PORT}`);
  console.log(` CORS Allowed Origin: http://localhost:3000`);
  console.log(`=================================================`);
});
