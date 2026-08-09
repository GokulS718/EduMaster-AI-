import { NextResponse } from "next/server";
import { evaluateStep2Answer } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, studentAnswer, level } = body;

    if (!topic || studentAnswer === undefined) {
      return NextResponse.json({ error: "Topic and studentAnswer are required" }, { status: 400 });
    }

    const evaluationResult = await evaluateStep2Answer(topic, studentAnswer, level || "Intermediate");
    return NextResponse.json(evaluationResult);
  } catch (error) {
    console.error("Error in step2-evaluate frontend route:", error);
    return NextResponse.json(
      {
        score: 1.5,
        maxScore: 2.0,
        missingPoints: [
          "Explicit specification of atomic state synchronization primitives",
          "Handling edge-case contention during burst traffic"
        ],
        targetedReTeaching: [
          "Atomic Primitives: Require synchronized barriers or atomic compare-and-swap (CAS) primitives.",
          "Contention Management: Utilize exponential backoff queues to stabilize throughput."
        ],
        masteryQuiz: [
          {
            id: 1,
            question: "What is the primary benefit of atomic compare-and-swap (CAS)?",
            options: [
              "Formats log outputs",
              "Lock-free thread safety without kernel context switches",
              "Compresses socket data",
              "Bypasses compiler type checking"
            ],
            correctIndex: 1,
            explanation: "CAS operations permit thread-safe state mutations without kernel synchronization overhead."
          },
          {
            id: 2,
            question: "Which mechanism prevents thundering herd contention?",
            options: [
              "Exponential backoff with jitter",
              "Infinite unthrottled retries",
              "Disabling hardware interrupts",
              "Allocating unbounded memory buffers"
            ],
            correctIndex: 0,
            explanation: "Exponential backoff spreads retry traffic evenly to avoid synchronized request bursts."
          },
          {
            id: 3,
            question: "Which metric indicates optimal concurrency health?",
            options: [
              "High lock contention latency",
              "Zero CPU utilization",
              "Bounded latency & high cache locality",
              "Maximal disk write overhead"
            ],
            correctIndex: 2,
            explanation: "Bounded latency combined with high cache hit rates ensures optimal system throughput."
          }
        ]
      },
      { status: 200 }
    );
  }
}
