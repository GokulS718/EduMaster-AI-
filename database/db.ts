import csTopicsSeed from "./seed/csTopics.json";
import { SubjectCategorySchema } from "./schemas/Topic";
import { LearningRecordSchema } from "./schemas/LearningRecord";

export class Database {
  private static instance: Database;
  private topics: SubjectCategorySchema[] = csTopicsSeed as SubjectCategorySchema[];
  private records: LearningRecordSchema[] = [
    {
      id: "rec-1",
      userId: "usr_101",
      topic: "Process Synchronization & Semaphores",
      level: "Intermediate",
      step1Bullets: [
        "Semaphores are integer variables accessed via atomic wait() and signal() operations.",
        "Mutexes provide exclusive ownership while counting semaphores control bounded resource access.",
        "Deadlocks and Priority Inversion are critical concurrency pitfalls."
      ],
      mockAnswer: "Semaphores control process access using P and V signals. Mutex is binary.",
      step2Score: 1.8,
      maxScore: 2.0,
      missingPoints: ["Mutex ownership semantics", "Priority Inversion handling"],
      targetedReTeaching: [
        "Mutex Ownership: Only the thread that locks a mutex can unlock it.",
        "Priority Inversion: Can be solved using Priority Inheritance Protocol."
      ],
      quizQuestions: [],
      quizScorePercent: 100,
      overallMasteryScore: 95,
      completedAt: "2026-08-08"
    },
    {
      id: "rec-2",
      userId: "usr_101",
      topic: "Red-Black Trees Balancing",
      level: "Advanced",
      step1Bullets: [
        "Red-Black trees are self-balancing binary search trees with color invariants.",
        "Every path from root to leaf has equal black height.",
        "Rotations and recoloring restore balance during insertion/deletion in O(log N)."
      ],
      mockAnswer: "Red black tree keeps nodes colored red or black and rotates when unbalanced.",
      step2Score: 1.5,
      maxScore: 2.0,
      missingPoints: ["Exact color rotation cases on insertion", "Root property black invariant"],
      targetedReTeaching: [
        "Color Case 1-3: Uncle node color dictates whether recoloring or tree rotation is needed.",
        "Root Invariant: Root node must always remain black."
      ],
      quizQuestions: [],
      quizScorePercent: 66,
      overallMasteryScore: 84,
      completedAt: "2026-08-07"
    }
  ];

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getTopics(): SubjectCategorySchema[] {
    return this.topics;
  }

  public getRecords(userId?: string): LearningRecordSchema[] {
    if (userId) {
      return this.records.filter((r) => r.userId === userId);
    }
    return this.records;
  }

  public addRecord(record: LearningRecordSchema): void {
    this.records.unshift(record);
  }
}

export const db = Database.getInstance();
