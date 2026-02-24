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
    contents: `You are a friendly and encouraging AI Study Tutor for students. 
    Create a highly detailed, student-friendly learning roadmap for: ${skill}. 
    
    Structure your response as follows:
    1. **Overview**: Why this skill is exciting and important in 2026.
    2. **Prerequisites**: What you should know before starting.
    3. **Phase 1-3**: A step-by-step guide with specific topics and recommended free resources.
    4. **Job Market Insight**: Use real-time data to show current salary ranges and top companies hiring for this skill.
    5. **Pro Tip**: A unique piece of advice for mastering this skill.
    
    Use a warm, approachable tone. Use emojis to make it engaging.`,
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
    contents: `Act as a career counselor for students. 
    What are the top 5 most exciting and in-demand tech skills for students to learn in 2026? 
    For each skill:
    - Give it a catchy title.
    - Explain why it's trending using real-time job market data.
    - Mention one "cool" project a student could build with it.
    
    Format with clear headings and bullet points.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text;
};
