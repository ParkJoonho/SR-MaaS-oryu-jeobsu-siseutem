import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateErrorTitle(content: string): Promise<string> {
  try {
    const systemPrompt = `You are a helpful assistant that generates concise, descriptive titles for error reports. 
Generate a title in Korean that summarizes the main issue described in the error content. 
The title should be brief (under 50 characters) and clearly indicate the problem.
Respond with JSON in this format: {'title': 'generated title'}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
          },
          required: ["title"],
        },
      },
      contents: `다음 오류 내용에 대한 적절한 제목을 생성해 주세요:\n\n${content}`,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.title || "오류 제목 생성 실패";
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating title:", error);
    throw new Error("Failed to generate title with AI");
  }
}
