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

export async function analyzeSystemCategory(content: string): Promise<string> {
  try {
    const systemPrompt = `당신은 철도 시스템 오류 분류 전문가입니다. 
다음 오류 내용을 분석하여 가장 적합한 시스템 카테고리를 선택해주세요.

카테고리 설명:
- 역무지원: 승객 서비스, 매표, 안내, 대기실, 플랫폼 관련 업무
- 안전관리: 보안, 안전 점검, 사고 예방, 응급상황 대응
- 시설물관리: 건물, 설비, 유지보수, 인프라 관리

JSON 형식으로 응답해주세요: {"system": "카테고리명"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            system: { 
              type: "string",
              enum: ["역무지원", "안전관리", "시설물관리"]
            },
          },
          required: ["system"],
        },
      },
      contents: `오류 내용: ${content}`,
    });

    const rawJson = response.text;
    
    if (rawJson) {
      const data = JSON.parse(rawJson);
      return data.system || "역무지원";
    } else {
      return "역무지원"; // 기본값
    }
  } catch (error) {
    console.error("Error analyzing system category:", error);
    return "역무지원"; // 오류 시 기본값 반환
  }
}
