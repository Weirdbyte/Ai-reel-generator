import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateVideoScript(paragraph) {
  const model = genAI.getGenerativeModel(
    {
      model: "gemini-2.5-flash"
    },
    {
      responseMimeType: "application/json"
    }
  );

  const prompt = `
You are an assistant that converts a given paragraph into a short-form video script.

TASK:
Convert the input paragraph into a scene-wise video script suitable for a informational reel.

RULES:
1. Split the content into 1 to 7 scenes, based strictly on paragraph length and logical flow.
2. Each scene MUST contain:
   - contextText: 1–2 simple, clear narration sentences taken directly from the paragraph.
   - imagePrompt: a highly detailed, context-aware visual description that clearly reflects what is being narrated.
3. The imagePrompt must visually represent the exact idea, emotion, and data mentioned in contextText (for example: legal events, financial impact, innovation, restructuring, growth).
4. Do NOT add new information or interpretations.
5. Do NOT repeat content across scenes.
6. Return ONLY valid JSON.
7. No markdown. No explanations.
8. Do not rewrite or rephrase content — only split it into scenes.

OUTPUT FORMAT:
{
  "scenes": [
    {
      "contextText": "",
      "imagePrompt": ""
    }
  ]
}

INPUT PARAGRAPH:
<<<
${paragraph}
>>>
`;


  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  });

  return JSON.parse(result.response.text());
}
