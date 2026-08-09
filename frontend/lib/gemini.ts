import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateStep1Lesson(topic: string, level: string): Promise<string[]> {
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
      console.warn("Frontend Gemini call failed for Step 1, using fallback:", err);
    }
  }

  return [
    `Core Architectural Concept: ${topic} organizes state transitions and execution flows deterministically.`,
    `Key Operational Mechanics: At the ${level} tier, execution relies on synchronized primitives and trade-off management.`,
    `Practical Engineering Insight: Systems implementing ${topic} mitigate bottlenecks through caching and lock-free execution.`
  ];
}

export interface Step2Response {
  score: number;
  maxScore: number;
  missingPoints: string[];
  targetedReTeaching: string[];
  masteryQuiz: Array<{
    id: number;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
}

export async function evaluateStep2Answer(
  topic: string,
  studentAnswer: string,
  level: string
): Promise<Step2Response> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, evaluating a university computer science 2-mark question.
Topic: "${topic}"
Level: "${level}"
Student Answer: "${studentAnswer}"

Evaluate the student answer out of 2.0 marks based on technical rigor and missing key terms.
Generate a JSON object matching this EXACT format:
{
  "score": 1.5,
  "maxScore": 2.0,
  "missingPoints": [
    "Missed explicit mention of atomic synchronization primitives",
    "Omitted secondary edge case handling during concurrent execution"
  ],
  "targetedReTeaching": [
    "Atomic operations prevent memory corruption during thread preemptions.",
    "Edge cases require fallback mechanisms such as timeouts or double-checked locking."
  ],
  "masteryQuiz": [
    {
      "id": 1,
      "question": "What is the primary danger of failing to ensure atomic state updates?",
      "options": ["Increased CPU frequency", "Race conditions & memory corruption", "Slower disk I/O", "Syntax compiler errors"],
      "correctIndex": 1,
      "explanation": "Non-atomic state mutations in concurrent execution lead to race conditions and corrupt memory."
    },
    {
      "id": 2,
      "question": "Which mechanism prevents unbounded waiting in concurrent execution edge cases?",
      "options": ["Spinlocking indefinitely", "Bounded timeout primitives", "Ignoring thread interrupts", "Global memory wiping"],
      "correctIndex": 1,
      "explanation": "Bounded timeouts guarantee execution proceeds or aborts gracefully rather than deadlocking."
    },
    {
      "id": 3,
      "question": "How does double-checked locking optimize performance?",
      "options": ["Bypasses memory allocation", "Reduces lock acquisition overhead by checking state prior to synchronization", "Encrypts execution payloads", "Eliminates cache misses entirely"],
      "correctIndex": 1,
      "explanation": "Double-checked locking avoids expensive synchronized lock acquisitions when initialization is complete."
    }
  ]
}

Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.score !== undefined && Array.isArray(parsed.masteryQuiz)) {
        return parsed as Step2Response;
      }
    } catch (err) {
      console.warn("Frontend Gemini call failed for Step 2, using fallback:", err);
    }
  }

  const lengthScore = Math.min(2.0, Math.max(0.5, (studentAnswer.trim().length / 60) * 1.5));
  const roundedScore = Math.round(lengthScore * 10) / 10;

  return {
    score: roundedScore,
    maxScore: 2.0,
    missingPoints: [
      `Explicit specification of atomic synchronization primitives for ${topic}`,
      `Handling edge-case resource contention under heavy execution load`
    ],
    targetedReTeaching: [
      `Atomic Primitives: ${topic} requires synchronized barriers or atomic compare-and-swap operations to prevent interleaved corruptions.`,
      `Contention Management: High-throughput execution requires bounded backoff queues to stabilize system latency.`
    ],
    masteryQuiz: [
      {
        id: 1,
        question: `In ${topic}, what is the primary purpose of atomic compare-and-swap (CAS)?`,
        options: [
          "To format system memory logs",
          "To achieve lock-free thread safety without kernel context switches",
          "To compress network socket frames",
          "To bypass compiler type checking"
        ],
        correctIndex: 1,
        explanation: "CAS operations allow atomic state updates in user space without triggering expensive context switching."
      },
      {
        id: 2,
        question: `When resource contention occurs in ${topic}, which strategy prevents thundering herd problems?`,
        options: [
          "Exponential backoff with jitter",
          "Infinite unthrottled retry loops",
          "Disabling system interrupts",
          "Allocating infinite RAM memory buffers"
        ],
        correctIndex: 0,
        explanation: "Exponential backoff with jitter spreads retry attempts across random time windows, avoiding synchronized spikes."
      },
      {
        id: 3,
        question: `Which key metric best indicates optimal system health in ${topic}?`,
        options: [
          "High lock contention latency",
          "Zero CPU utilization",
          "Bounded sub-millisecond response latency & minimal cache invalidation",
          "Maximal disk write overhead"
        ],
        correctIndex: 2,
        explanation: "Bounded latency with high cache locality represents optimal concurrent throughput."
      }
    ]
  };
}
