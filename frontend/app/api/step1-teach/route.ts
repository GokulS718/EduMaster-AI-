import { NextResponse } from "next/server";
import { generateStep1Lesson } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, level } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const lessonBullets = await generateStep1Lesson(topic, level || "Intermediate");
    return NextResponse.json({ initialLesson: lessonBullets });
  } catch (error) {
    console.error("Error in step1-teach frontend route:", error);
    return NextResponse.json(
      {
        initialLesson: [
          "Core Architectural Concept: State machine transitions and synchronized flow.",
          "Key Operational Mechanics: Algorithmic time-space tradeoffs and atomic invariants.",
          "Practical Engineering Insight: Bottleneck mitigation via caching and lock-free queues."
        ],
      },
      { status: 200 }
    );
  }
}
