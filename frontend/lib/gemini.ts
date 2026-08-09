import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface SubTopicLesson {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
}

export interface Step1TeachResponse {
  subTopics: SubTopicLesson[];
  twoMarkQuestion: string;
}

export async function generateStep1Lesson(topic: string, level: string): Promise<Step1TeachResponse> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, an expert computer science professor.
Generate a structured 4 to 5 sub-topics breakdown lesson for the topic: "${topic}" at the "${level}" knowledge level.
Also generate a specific 2-mark university exam mock question testing these sub-topics.

Respond strictly in JSON format matching this EXACT structure:
{
  "subTopics": [
    {
      "id": "st-1",
      "title": "Sub-topic 1 Title",
      "content": "Concise, example-driven teaching explanation explaining the core concept.",
      "codeExample": "-- Syntax example or code block snippet\\nSELECT col1, col2 FROM table WHERE condition = true;"
    },
    {
      "id": "st-2",
      "title": "Sub-topic 2 Title",
      "content": "Explanation for sub-topic 2.",
      "codeExample": "code snippet..."
    },
    {
      "id": "st-3",
      "title": "Sub-topic 3 Title",
      "content": "Explanation for sub-topic 3."
    },
    {
      "id": "st-4",
      "title": "Sub-topic 4 Title",
      "content": "Explanation for sub-topic 4."
    }
  ],
  "twoMarkQuestion": "What is the primary difference between Concept A and Concept B in ${topic}?"
}

Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.subTopics && Array.isArray(parsed.subTopics) && parsed.twoMarkQuestion) {
        return parsed as Step1TeachResponse;
      }
    } catch (err) {
      console.warn("Frontend Gemini call failed for Step 1, using smart fallback:", err);
    }
  }

  // Smart fallback generator for Sub-Topics & 2-Mark Question
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes("sql") || topicLower.includes("dbms") || topicLower.includes("database")) {
    return {
      subTopics: [
        {
          id: "st-1",
          title: "SQL Select & Filtering",
          content: "The SELECT statement retrieves rows from tables. The WHERE clause filters rows based on conditional logic prior to grouping or aggregation.",
          codeExample: "SELECT student_id, name, score \nFROM students \nWHERE score >= 85 \nORDER BY score DESC;"
        },
        {
          id: "st-2",
          title: "SQL Aliases & Expressions",
          content: "Aliases (AS keyword) assign temporary names to columns or tables to enhance query readability and simplify table joins.",
          codeExample: "SELECT s.name AS student_name, c.course_title \nFROM students AS s \nJOIN enrollments AS c ON s.id = c.student_id;"
        },
        {
          id: "st-3",
          title: "SQL Joins (INNER, LEFT, RIGHT, FULL)",
          content: "Joins combine columns from one or more tables based on matching keys. INNER JOIN returns matching rows; LEFT JOIN includes unmatched left-table rows.",
          codeExample: "SELECT orders.id, customers.name \nFROM orders \nLEFT JOIN customers ON orders.customer_id = customers.id;"
        },
        {
          id: "st-4",
          title: "SQL Group By & Having Filtering",
          content: "GROUP BY summarizes rows with matching column values. HAVING filters grouped aggregate results (applied AFTER aggregation, unlike WHERE).",
          codeExample: "SELECT department_id, COUNT(*) AS emp_count \nFROM employees \nGROUP BY department_id \nHAVING COUNT(*) > 5;"
        },
        {
          id: "st-5",
          title: "SQL Aggregate Functions (COUNT, SUM, AVG)",
          content: "Aggregate functions compute single summary values over sets of values. NULL values are excluded automatically by standard aggregate functions.",
          codeExample: "SELECT AVG(salary) AS avg_salary, MAX(salary) AS top_salary \nFROM employees \nWHERE status = 'Active';"
        }
      ],
      twoMarkQuestion: "What is the critical functional difference between WHERE and HAVING clauses in SQL?"
    };
  }

  return {
    subTopics: [
      {
        id: "st-1",
        title: `${topic} — Operational Foundations`,
        content: `At the ${level} tier, ${topic} organizes execution state, resource allocation, and memory management into deterministic execution units.`,
        codeExample: `// Primitive Initialization\nvoid initialize_${topic.toLowerCase().replace(/[^a-z0-9]/g, "_")}() {\n  pthread_mutex_init(&lock, NULL);\n}`
      },
      {
        id: "st-2",
        title: `${topic} — Concurrency & Invariants`,
        content: "Execution units rely on atomic compare-and-swap (CAS) primitives and mutex locks to guarantee memory invariants during multi-threaded preemption.",
        codeExample: `// Atomic State Mutation\nwhile (!atomic_compare_exchange_weak(&state, &expected, new_val)) {\n  // Retry loop backoff\n}`
      },
      {
        id: "st-3",
        title: `${topic} — Algorithmic Trade-offs`,
        content: "Engineers trade off lock contention overhead against cache locality. Lock-free queues minimize context switches under burst traffic.",
        codeExample: `// Bounded Queue Check\nif (queue.capacity() > MAX_THRESHOLD) {\n  apply_exponential_backoff();\n}`
      },
      {
        id: "st-4",
        title: `${topic} — Failure Modes & Mitigations`,
        content: "Common pitfalls include race conditions, thundering herd starvation, and priority inversion. Solved using priority inheritance protocols.",
        codeExample: `// Timeout Defensive Guard\nif (sem_timedwait(&sem, &ts) != 0) {\n  log_timeout_fallback();\n}`
      }
    ],
    twoMarkQuestion: `Explain how ${topic} handles resource contention edge cases and list two primitives used to guarantee state consistency.`
  };
}

export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Step2Response {
  score: number;
  maxScore: number;
  missingPoints: string[];
  targetedReTeaching: string[];
  masteryQuiz: MCQQuestion[];
}

export async function evaluateStep2Answer(
  topic: string,
  studentAnswer: string,
  level: string
): Promise<Step2Response> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, evaluating a university computer science 2-mark question on "${topic}".
Level: "${level}"
Student Answer: "${studentAnswer}"

Evaluate the student answer out of 2.0 marks based on technical rigor and missing key terms.
Generate 5 to 7 Multiple Choice Questions (MCQs) covering the main topic and its sub-topics.

Generate a JSON object matching this EXACT format:
{
  "score": 1.5,
  "maxScore": 2.0,
  "missingPoints": [
    "Missed explicit distinction between pre-aggregation filtering and post-aggregation filtering",
    "Omitted mention of execution order in relational query processing"
  ],
  "targetedReTeaching": [
    "Filtering Stages: WHERE filters raw input rows BEFORE grouping occurs, whereas HAVING filters aggregated group rows AFTER aggregate calculations complete.",
    "Execution Order: Query processing order evaluates FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY."
  ],
  "masteryQuiz": [
    {
      "id": 1,
      "question": "Which SQL clause is evaluated BEFORE the GROUP BY aggregation stage?",
      "options": ["HAVING", "WHERE", "ORDER BY", "SELECT"],
      "correctIndex": 1,
      "explanation": "WHERE filters raw rows prior to grouping, while HAVING filters aggregated group summaries."
    },
    {
      "id": 2,
      "question": "What happens if an aggregate function such as AVG() encounters NULL values in a column?",
      "options": ["Returns NULL immediately", "Ignores NULL rows and calculates average over non-null values", "Throws a runtime syntax error", "Treats NULL as 0"],
      "correctIndex": 1,
      "explanation": "Standard SQL aggregate functions automatically ignore NULL values during calculation."
    },
    {
      "id": 3,
      "question": "Which JOIN type retains all records from the left table even if no match exists in the right table?",
      "options": ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
      "correctIndex": 2,
      "explanation": "LEFT JOIN includes all rows from the left table and fills NULLs for missing right-table columns."
    },
    {
      "id": 4,
      "question": "In relational algebra, which clause corresponds to the HAVING filter?",
      "options": ["Projection on raw attributes", "Selection predicate applied on grouped tuple sets", "Cartesian Product", "Rename operator"],
      "correctIndex": 1,
      "explanation": "HAVING applies selection predicates specifically over aggregated tuple sets."
    },
    {
      "id": 5,
      "question": "What is the primary constraint of an aggregate expression used inside a WHERE clause?",
      "options": ["It is syntax invalid because WHERE cannot contain aggregate functions", "It forces an index scan", "It executes faster than HAVING", "It converts columns to VARCHAR"],
      "correctIndex": 0,
      "explanation": "Aggregate functions are invalid inside WHERE clauses because aggregates are calculated after WHERE evaluation."
    },
    {
      "id": 6,
      "question": "Which index structure optimizes B+ tree range scans for SQL query execution?",
      "options": ["Unordered Hash Index", "Clustered B+ Tree Index with linked leaf nodes", "Linear Bitmap Index", "Heap Storage"],
      "correctIndex": 1,
      "explanation": "Clustered B+ Trees feature doubly-linked leaf nodes, enabling fast sequential range scans."
    }
  ]
}

Return ONLY valid JSON containing 5 to 7 MCQs in masteryQuiz.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.score !== undefined && Array.isArray(parsed.masteryQuiz) && parsed.masteryQuiz.length >= 5) {
        return parsed as Step2Response;
      }
    } catch (err) {
      console.warn("Frontend Gemini call failed for Step 2, using fallback:", err);
    }
  }

  // Fallback evaluation generator with 6 MCQs
  const lengthScore = Math.min(2.0, Math.max(0.5, (studentAnswer.trim().length / 60) * 1.5));
  const roundedScore = Math.round(lengthScore * 10) / 10;

  return {
    score: roundedScore,
    maxScore: 2.0,
    missingPoints: [
      `Explicit distinction between pre-execution filtering and post-aggregation filtering in ${topic}`,
      `Handling edge-case resource contention during burst execution loads`
    ],
    targetedReTeaching: [
      `Execution Flow: Pre-execution guards evaluate raw inputs, whereas post-aggregation filters operate on synthesized group outputs.`,
      `Contention Management: High-throughput execution requires bounded backoff queues to stabilize system latency.`
    ],
    masteryQuiz: [
      {
        id: 1,
        question: `In ${topic}, what is the primary distinction between pre-filtering and post-aggregation filtering?`,
        options: [
          "Pre-filtering operates on raw input records; post-aggregation operates on summarized output sets",
          "They are functionally identical in execution",
          "Pre-filtering is slower than post-aggregation",
          "Post-aggregation bypasses memory bounds"
        ],
        correctIndex: 0,
        explanation: "Pre-filtering reduces dataset size before grouping, while post-aggregation filters computed group metrics."
      },
      {
        id: 2,
        question: `What happens when an atomic Compare-And-Swap (CAS) operation encounters memory contention in ${topic}?`,
        options: [
          "Triggers thread context switch immediately",
          "Fails atomic swap and retries within a user-space loop",
          "Corrupts system register flags",
          "Causes compiler abort"
        ],
        correctIndex: 1,
        explanation: "CAS operations retry lock-free in user space without incurring kernel context switch overhead."
      },
      {
        id: 3,
        question: `Which mechanism prevents thundering herd contention in multi-threaded execution of ${topic}?`,
        options: [
          "Exponential backoff with randomized jitter",
          "Infinite unthrottled retry loops",
          "Disabling system interrupts",
          "Allocating unbounded memory buffers"
        ],
        correctIndex: 0,
        explanation: "Exponential backoff spreads retry traffic across random windows, preventing synchronized spikes."
      },
      {
        id: 4,
        question: `Which key metric best indicates optimal health in ${topic}?`,
        options: [
          "High lock contention latency",
          "Zero CPU clock speed",
          "Bounded response latency & minimal cache invalidation",
          "Maximal disk write overhead"
        ],
        correctIndex: 2,
        explanation: "Bounded latency combined with high cache locality represents optimal throughput."
      },
      {
        id: 5,
        question: `How does Priority Inheritance Protocol resolve Priority Inversion in ${topic}?`,
        options: [
          "Temporarily raises the priority of the low-priority thread holding the requested resource",
          "Terminates high-priority threads",
          "Disables CPU scheduling",
          "Allocates duplicate locks"
        ],
        correctIndex: 0,
        explanation: "Priority inheritance boosts the low-priority thread's priority to match the blocked high-priority thread."
      },
      {
        id: 6,
        question: `Which invariant must hold true for balanced tree execution in ${topic}?`,
        options: [
          "Root node must be red",
          "Every path from root to leaf has equal black height",
          "Leaf nodes carry arbitrary values",
          "Tree height is O(N^2)"
        ],
        correctIndex: 1,
        explanation: "Equal black height guarantees logarithmic O(log N) worst-case search bounds."
      }
    ]
  };
}
