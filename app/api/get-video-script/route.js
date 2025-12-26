import { NextResponse } from "next/server";
import { generateVideoScript } from "@/lib/gemini";

export async function POST(req) {
  try {
    const { paragraph } = await req.json();

    if (!paragraph || typeof paragraph !== "string") {
      return NextResponse.json(
        { error: "Paragraph is required" },
        { status: 400 }
      );
    }

    const script = await generateVideoScript(paragraph);

    if (!Array.isArray(script.scenes)) {
      return NextResponse.json(
        { error: "Invalid script format from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json(script);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
