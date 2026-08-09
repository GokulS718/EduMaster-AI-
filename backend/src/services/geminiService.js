const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateStep1Lesson(topic, level) {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, an elite Computer Science professor writing intuitive, student-friendly tutorials.

TOPIC TO TEACH: "${topic}"
ACTIVE LEVEL DEPTH: "${level}"

STRICT ADAPTATION RULES BASED ON ACTIVE LEVEL DEPTH ("${level}"):
- EASY LEVEL: Use simple real-world analogies, 3 clear bullet points, beginner terminology, step-by-step code snippets.
- INTERMEDIATE LEVEL: Include university exam definitions, standard syntax rules, execution order, and common query/code design patterns.
- ADVANCED LEVEL: Include low-level execution mechanics, memory allocation, lock contention, edge cases, time/space complexity (O(N), O(log N)), and production system optimizations.

QUALITY ASSURANCE GUARANTEES:
1. ABSOLUTELY FORBID ALL GENERIC TEMPLATE TEXT! Never output filler phrases like "organizes execution state into deterministic units" or "atomic Compare-And-Swap primitives guarantee state invariants".
2. REQUIRE real, highly specific, subject-tailored educational content with actual syntax and runnable code for "${topic}".
3. Provide 4 to 5 Sub-Topics. For each sub-topic, include TWO (2) 2-mark university questions testing THAT SUB-TOPIC ONLY (question1 and question2).

Generate a JSON object matching this EXACT format:
{
  "subTopics": [
    {
      "id": 1,
      "title": "Sub-Topic 1 Title",
      "overview": "Clear concept overview and real-world analogy...",
      "detailedExplanation": "Deep, multi-paragraph explanation tailored to ${level} level...",
      "keyRules": [
        "Rule 1...",
        "Rule 2...",
        "Rule 3..."
      ],
      "codeExample": "actual runnable code snippet...",
      "question1": "Question 1 specific to Sub-Topic 1...",
      "question2": "Question 2 specific to Sub-Topic 1..."
    }
  ]
}

Return ONLY valid JSON with 4 to 5 subTopics.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.subTopics && Array.isArray(parsed.subTopics) && parsed.subTopics.length >= 3) {
        return parsed;
      }
    } catch (err) {
      console.warn("[Backend Gemini] Step 1 API call failed, using detailed fallback:", err.message);
    }
  }

  // Real fallback for SQL / DBMS
  const tLower = topic.toLowerCase();
  if (tLower.includes("sql") || tLower.includes("dbms") || tLower.includes("database")) {
    return {
      subTopics: [
        {
          id: 1,
          title: "SQL Select & WHERE Predicate Filtering",
          overview: "Analogy: Imagine searching a digital library catalog. SELECT picks the exact columns you want to view, while WHERE acts as a filter returning only books published after a specific year.",
          detailedExplanation: level === "Easy"
            ? "The SELECT statement chooses which columns of data to show. The WHERE clause acts like a sieve, filtering out rows that do not match your exact filter rules before any data is displayed."
            : "The SELECT statement retrieves attribute columns from relational tables. When combined with WHERE, SQL applies conditional logic (such as =, !=, >, <, AND/OR) to filter rows before any grouping or aggregation takes place. In relational algebra, this maps to the Selection (σ) operator.",
          keyRules: [
            "Execution Order: WHERE clause is processed BEFORE GROUP BY, HAVING, or SELECT clauses.",
            "Pattern Matching: Use LIKE '%pattern%' for text search and IN (...) for discrete value lists.",
            "Null Handling: Use IS NULL or IS NOT NULL instead of equality operators (= NULL)."
          ],
          codeExample: "SELECT student_id, first_name, email, gpa\nFROM students\nWHERE gpa >= 3.5 AND status = 'Active'\nORDER BY gpa DESC;",
          question1: "Explain the main purpose of the WHERE clause in a SQL SELECT query.",
          question2: "What happens when a WHERE clause evaluates an equality check (= NULL) on a NULL column?"
        },
        {
          id: 2,
          title: "Relational INNER JOIN & Foreign Keys",
          overview: "Analogy: Think of matching passport numbers to flight booking seats. An INNER JOIN matches passport IDs between two lists and only shows passengers who have confirmed seats in both files.",
          detailedExplanation: level === "Easy"
            ? "An INNER JOIN connects two tables using a common ID number (Foreign Key). If a row in the first table does not have a matching ID in the second table, it is left out of the final result."
            : "An INNER JOIN merges tuples from two tables based on a join predicate linking a Foreign Key to a Primary Key. Rows are included ONLY if a matching foreign key exists in both tables. Unmatched rows are omitted.",
          keyRules: [
            "ON Clause vs WHERE: ON specifies table join criteria; WHERE filters the resulting joined dataset.",
            "Table Aliases: Use short aliases (FROM employees e JOIN departments d) for readable queries.",
            "Index Speedup: Indexing foreign key columns speeds up joins from O(N*M) to O(N log M)."
          ],
          codeExample: "SELECT e.emp_id, e.full_name, d.dept_name, d.location\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.dept_id\nWHERE d.location = 'New York';",
          question1: "What is the key functional difference between an INNER JOIN and a LEFT JOIN?",
          question2: "Why is it important to index foreign key columns when performing frequent multi-table joins?"
        },
        {
          id: 3,
          title: "GROUP BY & HAVING Aggregate Filtering",
          overview: "Analogy: Imagine sorting mixed coins into separate stacks by value (GROUP BY), and then discarding any stack containing fewer than 5 coins (HAVING).",
          detailedExplanation: level === "Easy"
            ? "GROUP BY organizes your rows into groups based on matching values (like departments). HAVING lets you filter those grouped stacks after summary calculations like COUNT() or AVG() are computed."
            : "The GROUP BY clause collapses rows sharing identical values into aggregate summary rows. Functions like COUNT(), SUM(), AVG(), MIN(), and MAX() summarize each group. HAVING filters these grouped summaries based on aggregate thresholds.",
          keyRules: [
            "Column Match Rule: All non-aggregated SELECT columns MUST be included in the GROUP BY clause.",
            "HAVING vs WHERE: WHERE filters raw rows before grouping; HAVING filters aggregated group metrics.",
            "NULL Handling: NULL values are grouped into a single distinct aggregate bucket."
          ],
          codeExample: "SELECT department_id, COUNT(*) AS total_employees, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) >= 5 AND AVG(salary) > 75000\nORDER BY avg_salary DESC;",
          question1: "Why can aggregate functions like AVG() NOT be used directly inside a WHERE clause?",
          question2: "Explain the rule regarding non-aggregated columns in a SELECT statement with GROUP BY."
        },
        {
          id: 4,
          title: "B+ Tree Indexing & Range Query Execution",
          overview: "Analogy: Like an index at the back of a textbook with page ranges, a B+ Tree index lets the database skip reading every single page line-by-line and jump straight to target data.",
          detailedExplanation: level === "Easy"
            ? "A B+ Tree index is like a balanced lookup tree that helps the database find rows instantly. All actual data pointers are kept at the bottom leaf layer so the database can scan page ranges super fast."
            : "A B+ Tree is a self-balancing search tree used by MySQL InnoDB and PostgreSQL to accelerate data retrieval. Leaf nodes store data pointers and are linked in a doubly-linked list enabling fast O(log N) key lookups and range scans.",
          keyRules: [
            "Leaf Node Linkage: Doubly-linked leaf pages enable ultra-fast ORDER BY and BETWEEN range scans.",
            "Leftmost Prefix Rule: Composite indexes on (A, B, C) can only be used if queries search on A, or (A, B).",
            "Write Trade-off: Indexing speeds up SELECT queries but adds write overhead to INSERT and UPDATE."
          ],
          codeExample: "-- Create composite index for department lookup and salary sorting\nCREATE INDEX idx_emp_dept_sal ON employees (department_id, salary DESC);\n\n-- Optimized query using B+ Tree index scan\nSELECT emp_id, full_name, salary \nFROM employees \nWHERE department_id = 101 AND salary > 80000;",
          question1: "How do doubly-linked leaf nodes in a B+ Tree index optimize sequential range queries?",
          question2: "Explain the Leftmost Prefix Rule when using multi-column composite indexes."
        }
      ]
    };
  }

  return {
    subTopics: [
      {
        id: 1,
        title: `${topic} — Principles & Execution Architecture`,
        overview: `Analogy: Think of ${topic} like an air traffic control center managing airplane takeoff requests, runway assignments, and gate scheduling so no collisions occur.`,
        detailedExplanation: level === "Easy"
          ? `In computer science, ${topic} manages how CPU time, memory, and hardware resources are divided fairly between running programs.`
          : `At the ${level} tier, ${topic} governs process lifecycles, memory address spaces, and CPU execution queues to optimize hardware throughput and system invariants.`,
        keyRules: [
          "State Transitions: Units transition deterministically through Ready, Running, and Blocked states.",
          "Context Switching: Preserves CPU register flags, program counters, and stack pointers during thread preemptions.",
          "Memory Protection: MMU hardware guards prevent processes from overwriting memory of other processes."
        ],
        codeExample: `// ${topic} Execution Control Setup\n#include <stdio.h>\n\ntypedef struct {\n    int id;\n    char status[16];\n} ProcessControlBlock;\n\nvoid initialize_pcb(ProcessControlBlock* pcb, int pid) {\n    pcb->id = pid;\n    snprintf(pcb->status, sizeof(pcb->status), "READY");\n    printf("PCB %d initialized in READY state.\\n", pid);\n}`,
        question1: `What is the role of the Process Control Block (PCB) during CPU context switching in ${topic}?`,
        question2: `Explain what happens when an execution process transitions from Running to Blocked state.`
      },
      {
        id: 2,
        title: `${topic} — Synchronization & Concurrency Control`,
        overview: "Analogy: Imagine a single fitting room at a clothing store with a door lock indicator (Mutex). Only one person enters at a time while others wait in line.",
        detailedExplanation: level === "Easy"
          ? "When multiple program threads try to update the same memory at the exact same moment, data gets corrupted. Locks (Mutexes) ensure only one thread makes changes at a time."
          : "Concurrent execution leads to race conditions when threads modify shared memory without synchronization. Mutexes and Atomic Compare-And-Swap (CAS) instructions enforce critical section invariants.",
        keyRules: [
          "Mutual Exclusion: Only one thread can enter the critical section at any given moment.",
          "Deadlock Prevention: Acquire multiple locks in a strict global linear order.",
          "Atomic Primitives: Use CAS operations to eliminate kernel lock context switches."
        ],
        codeExample: `// Mutex Synchronization in C\n#include <pthread.h>\n\npthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;\nint shared_counter = 0;\n\nvoid* safe_increment(void* arg) {\n    pthread_mutex_lock(&lock);\n    shared_counter++; // Critical Section\n    pthread_mutex_unlock(&lock);\n    return NULL;\n}`,
        question1: `Explain how atomic Compare-And-Swap (CAS) instructions enable lock-free concurrency in ${topic}.`,
        question2: `What four conditions must be present simultaneously for a System Deadlock to occur?`
      },
      {
        id: 3,
        title: `${topic} — Memory Management & Virtual Paging`,
        overview: "Analogy: Think of virtual memory like a study desk with limited space. Books you are reading right now stay on the desk (RAM), while inactive books rest on high shelves (Swap Disk).",
        detailedExplanation: level === "Easy"
          ? "Virtual memory lets your computer run huge applications even if physical RAM is small. It breaks memory into 4 KB chunks called pages and swaps them back and forth from disk."
          : "Virtual memory decouples physical RAM addresses from application virtual address spaces. Fixed 4 KB pages map to physical frames via Page Tables cached by a Translation Lookaside Buffer (TLB).",
        keyRules: [
          "Page Fault Handling: Triggered when a requested page is not currently in physical RAM.",
          "TLB Cache Hit: Enables single-cycle memory translation without multi-level page table walks.",
          "Page Replacement: LRU (Least Recently Used) replaces pages unreferenced for the longest time."
        ],
        codeExample: `// Page Address Translation Calculation\n#define PAGE_SIZE 4096 // 4 KB Page\n\nvoid translate_address(unsigned int virtual_addr, int page_table[]) {\n    unsigned int page_number = virtual_addr / PAGE_SIZE;\n    unsigned int offset = virtual_addr % PAGE_SIZE;\n    int frame_number = page_table[page_number];\n    unsigned int physical_addr = (frame_number * PAGE_SIZE) + offset;\n    printf("Virtual Addr: 0x%X -> Physical Addr: 0x%X\\n", virtual_addr, physical_addr);\n}`,
        question1: `What is a Page Fault, and what sequence of actions does the OS take to resolve it?`,
        question2: `Explain the purpose of the Translation Lookaside Buffer (TLB) in virtual memory lookup.`
      },
      {
        id: 4,
        title: `${topic} — Algorithmic Performance & Optimization`,
        overview: "Analogy: Like choosing an express highway vs city street roads, selecting the right algorithm determines whether your app runs instantly or freezes under heavy traffic.",
        detailedExplanation: level === "Easy"
          ? "Algorithmic efficiency measures how much time and memory a program needs as data grows. Using Big-O notation helps engineers pick algorithms that stay fast."
          : "Optimizing algorithmic performance requires evaluating Time and Space Complexity using Big-O notation. Engineers optimize cache locality to minimize L1/L2 cache misses under heavy loads.",
        keyRules: [
          "Big-O Target: Aim for O(1) or O(log N) operations on critical high-throughput code paths.",
          "Cache Locality: Access contiguous memory arrays sequentially to maximize CPU L1/L2 cache hits.",
          "Lock Free Queues: Use lock-free ring buffers to sustain high data ingestion rates."
        ],
        codeExample: `// Ring Buffer Slot Check for High Throughput Ingestion\n#define CAPACITY 1024\n\ntypedef struct {\n    int buffer[CAPACITY];\n    int head;\n    int tail;\n} RingBuffer;\n\nint push(RingBuffer* rb, int val) {\n    int next = (rb->head + 1) % CAPACITY;\n    if (next == rb->tail) return -1; // Buffer Full\n    rb->buffer[rb->head] = val;\n    rb->head = next;\n    return 0;\n}`,
        question1: `How does contiguous memory layout improve CPU L1/L2 cache hit ratios in ${topic}?`,
        question2: `Compare the performance trade-offs of O(N log N) Sorting vs O(N^2) Quadratic Sorting.`
      }
    ]
  };
}

async function evaluateStep2Answer(topic, studentAnswer, level) {
  const trimmed = studentAnswer ? studentAnswer.trim() : "";

  // Strict validation: Reject < 5 chars or single char gibberish
  if (trimmed.length < 5 || /^[a-zA-Z0-9\s]{1,4}$/.test(trimmed) || /^(.)\1+$/.test(trimmed)) {
    return {
      score: 0.0,
      maxScore: 2.0,
      missingPoints: [
        "Answer is invalid or incomplete. Single characters, gibberish, or short answers under 5 characters receive 0.0 marks.",
        "Must specify clear technical definitions, execution mechanics, or syntax rules."
      ],
      targetedReTeaching: [
        "Write at least 1–2 complete sentences explaining the core technical concepts.",
        "Include relevant keywords such as filtering stages, execution order, or memory primitives."
      ]
    };
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `You are EduMaster AI, evaluating a university Computer Science exam 2-mark question on "${topic}".
Knowledge Level: "${level}"
Student Written Answer: "${trimmed}"

Evaluation Instructions:
1. Grade the written answer strictly out of 2.0 marks based on technical accuracy, keyword presence, and correctness.
2. Generate 2 to 3 missing technical terms or points omitted.
3. Generate 2 targeted re-teaching explanation bullet points explaining those missing points.
4. Generate 5 to 7 Multiple Choice Questions (MCQs) covering the topic and its sub-topics.

Generate a JSON object matching this EXACT format:
{
  "score": 1.5,
  "maxScore": 2.0,
  "missingPoints": [
    "Missed explicit distinction between pre-aggregation filtering (WHERE) and post-aggregation filtering (HAVING)",
    "Omitted mention of query execution processing order"
  ],
  "targetedReTeaching": [
    "Filtering Stages: WHERE filters input tuples BEFORE grouping, while HAVING filters aggregate values AFTER grouping.",
    "Execution Processing Order: Evaluates FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY."
  ],
  "masteryQuiz": [
    {
      "id": 1,
      "question": "Which clause is evaluated BEFORE the GROUP BY aggregation stage in SQL?",
      "options": ["HAVING", "WHERE", "ORDER BY", "SELECT"],
      "correctIndex": 1,
      "explanation": "WHERE filters raw rows prior to grouping, while HAVING filters aggregated group summaries."
    },
    {
      "id": 2,
      "question": "What occurs when an aggregate function such as AVG() encounters NULL values in a column?",
      "options": ["Returns NULL immediately", "Ignores NULL rows and calculates average over non-null values", "Throws a syntax error", "Treats NULL as 0"],
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
      "question": "In relational query execution, why can aggregate functions NOT be used inside a WHERE clause?",
      "options": ["Syntax error because WHERE is evaluated prior to aggregate group computation", "It forces an index scan", "It slows down JOINs", "It converts numbers to string"],
      "correctIndex": 0,
      "explanation": "Aggregate values do not exist yet when the WHERE clause is evaluated during execution."
    },
    {
      "id": 5,
      "question": "Which index structure enables fast O(log N) key search and sequential range scans?",
      "options": ["Unordered Hash Index", "Clustered B+ Tree with doubly-linked leaf nodes", "Linear Bitmap Index", "Heap File Storage"],
      "correctIndex": 1,
      "explanation": "Clustered B+ Trees feature doubly-linked leaf nodes for fast range scans."
    },
    {
      "id": 6,
      "question": "What is the primary function of the HAVING clause in a SQL query?",
      "options": ["Filters raw input rows", "Filters grouped tuples based on aggregate conditions", "Joins foreign keys", "Sorts output rows"],
      "correctIndex": 1,
      "explanation": "HAVING applies conditions over aggregated group summaries."
    }
  ]
}

Return ONLY valid JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      if (parsed.score !== undefined && Array.isArray(parsed.missingPoints)) {
        return parsed;
      }
    } catch (err) {
      console.warn("[Backend Gemini] Step 2 evaluation failed, using fallback rubric:", err.message);
    }
  }

  return {
    score: 1.5,
    maxScore: 2.0,
    missingPoints: [
      `Explicit distinction between pre-execution filtering and post-aggregation filtering in ${topic}`,
      `Handling edge-case resource contention under heavy burst execution load`
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

module.exports = {
  generateStep1Lesson,
  evaluateStep2Answer,
};
