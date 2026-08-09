import { NextResponse } from "next/server";
import { generateStep1Lesson } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, level } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const data = await generateStep1Lesson(topic, level || "Intermediate");
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in step1-teach frontend route:", error);
    return NextResponse.json(
      {
        subTopics: [
          {
            id: "st-1",
            title: "Core Mechanics",
            content: "State machine transitions and synchronized execution flow.",
            codeExample: "SELECT * FROM core_table WHERE status = 'ACTIVE';"
          }
        ],
        twoMarkQuestion: "Explain the primary difference between pre-filtering and post-aggregation filtering."
      },
      { status: 200 }
    );
  }
}
