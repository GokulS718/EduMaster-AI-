const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateStep1Lesson(topic, level) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, an expert computer science professor.
Generate a concise, high-yield 3-bullet intro lesson for the topic: "${topic}" at the "${level}" knowledge level.
Respond strictly in JSON array format containing exactly 3 strings representing bullet points. No markdown code blocks, just raw JSON string array.
Example: ["Bullet 1...", "Bullet 2...", "Bullet 3..."]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3);
      }
    } catch (err) {
      console.warn("[Backend Gemini] Step 1 API call failed, using fallback:", err.message);
    }
  }

  return [
    `Core Architectural Concept: ${topic} organizes system state, resource scheduling, and operational control deterministically.`,
    `Key Operational Mechanics: At the ${level} tier, execution relies on synchronized primitives, algorithmic trade-offs (latency vs throughput), and invariant state bounds.`,
    `Practical Engineering Insight: Systems implementing ${topic} prevent bottlenecks through caching, lock-free concurrency, or protocol handshakes to guarantee fault tolerance.`
  ];
}

async function evaluateStep2Answer(topic, studentAnswer, level) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, evaluating a university computer science 2-mark question.
Topic: "${topic}"
Level: "${level}"
Student Answer: "${studentAnswer}"

Evaluate the answer out of 2.0 marks based on technical accuracy and missing key points.
Generate a JSON object matching this EXACT format:
{
  "score": 1.5,
  "maxScore": 2.0,
  "missingPoints": [
    "Missed explicit mention of atomic synchronization primitives",
    "Omitted secondary edge case handling during burst traffic"
  ],
  "targetedReTeaching": [
    "Atomic Primitives: Atomic operations prevent memory corruption during concurrent thread preemptions.",
    "Contention Management: Edge cases require fallback backoff queues or bounded timeouts."
  ],
  "masteryQuiz": [
    {
      "id": 1,
      "question": "What is the primary danger of failing to ensure atomic state updates?",
      "options": ["Increased CPU clock speed", "Race conditions & memory corruption", "Slower disk I/O", "Syntax compiler warnings"],
      "correctIndex": 1,
      "explanation": "Non-atomic state mutations in concurrent execution cause race conditions and corrupt memory."
    },
    {
      "id": 2,
      "question": "Which mechanism prevents thundering herd contention?",
      "options": ["Spinlocking indefinitely", "Exponential backoff with jitter", "Disabling thread interrupts", "Global memory wiping"],
      "correctIndex": 1,
      "explanation": "Exponential backoff spreads retry bursts across randomized windows, stabilizing system load."
    },
    {
      "id": 3,
      "question": "How does double-checked locking optimize performance?",
      "options": ["Bypasses memory allocation", "Reduces lock acquisition overhead by checking state prior to synchronization", "Encrypts payload frames", "Eliminates cache misses entirely"],
      "correctIndex": 1,
      "explanation": "Double-checked locking avoids expensive synchronized lock acquisitions when state is already initialized."
    }
  ]
}

Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.score !== undefined && Array.isArray(parsed.masteryQuiz)) {
        return parsed;
      }
    } catch (err) {
      console.warn("[Backend Gemini] Step 2 API call failed, using fallback:", err.message);
    }
  }

  const lengthScore = Math.min(2.0, Math.max(0.5, (studentAnswer.trim().length / 60) * 1.5));
  const roundedScore = Math.round(lengthScore * 10) / 10;

  return {
    score: roundedScore,
    maxScore: 2.0,
    missingPoints: [
      `Explicit specification of atomic synchronization primitives for ${topic}`,
      `Handling edge-case resource contention under heavy execution loads`
    ],
    targetedReTeaching: [
      `Atomic Primitives: ${topic} relies on atomic compare-and-swap (CAS) or barrier locks to prevent memory corruption.`,
      `Contention Management: High-throughput execution requires bounded backoff queues to stabilize latency.`
    ],
    masteryQuiz: [
      {
        id: 1,
        question: `In ${topic}, what is the primary benefit of atomic compare-and-swap (CAS)?`,
        options: [
          "Formats log outputs",
          "Lock-free thread safety without kernel context switches",
          "Compresses network socket frames",
          "Bypasses compiler type checking"
        ],
        correctIndex: 1,
        explanation: "CAS operations permit thread-safe state updates in user space without kernel context switching overhead."
      },
      {
        id: 2,
        question: `When resource contention occurs in ${topic}, which strategy prevents thundering herd issues?`,
        options: [
          "Exponential backoff with jitter",
          "Infinite unthrottled retry loops",
          "Disabling system interrupts",
          "Allocating unbounded RAM memory buffers"
        ],
        correctIndex: 0,
        explanation: "Exponential backoff spreads retry traffic across random time windows, avoiding synchronized spikes."
      },
      {
        id: 3,
        question: `Which key metric best indicates optimal system health in ${topic}?`,
        options: [
          "High lock contention latency",
          "Zero CPU utilization",
          "Bounded response latency & minimal cache invalidation",
          "Maximal disk write overhead"
        ],
        correctIndex: 2,
        explanation: "Bounded latency combined with high cache locality represents optimal system throughput."
      }
    ]
  };
}

module.exports = {
  generateStep1Lesson,
  evaluateStep2Answer,
};
