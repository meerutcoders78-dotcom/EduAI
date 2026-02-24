import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSkillRoadmap = async (skill: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Create a detailed learning roadmap for ${skill}. Include current trends, required tools, and a step-by-step guide. Use real-time job market data to justify the recommendations.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
};

export const getRecommendedSkills = async () => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: "What are the top 6 most in-demand tech skills for 2026? Provide a brief reason for each based on current job market trends.",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
};
