const CACHE_PREFIX = "abilities_ai_cache_";
const CACHE_EXPIRY = 10 * 60 * 60 * 1000; // 10 hours in milliseconds

const getApiKey = () => {
  const apiKey = process.env.ASI_API_KEY;
  if (!apiKey) {
    // During transition, we'll return a placeholder to avoid crashing
    return "PENDING_ASI_KEY";
  }
  return apiKey;
};

const ASI_ENDPOINT = "https://api.asi1.ai/v1/chat/completions"; // Placeholder for ASI One endpoint

const getFromCache = (key: string) => {
  const cached = localStorage.getItem(CACHE_PREFIX + key);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setInCache = (key: string, data: string) => {
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isQuotaError = error?.message?.includes("429") || error?.status === 429;
      if (isQuotaError && i < retries - 1) {
        await sleep(delay * Math.pow(2, i));
        continue;
      }
      throw error;
    }
  }
};

const callASI = async (prompt: string, isJson = false) => {
  const apiKey = getApiKey();
  if (apiKey === "PENDING_ASI_KEY") {
    throw new Error("ASI One API Key is required. Please provide it in the environment variables.");
  }

  const response = await fetch(ASI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "asi-1", // Placeholder model name
      messages: [{ role: "user", content: prompt }],
      response_format: isJson ? { type: "json_object" } : undefined,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`ASI One API Error: ${response.status} ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const generateSkillRoadmap = async (skill: string) => {
  const cacheKey = `roadmap_${skill.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const result = await callWithRetry(async () => {
    return await callASI(`You are a friendly and encouraging AI Study Tutor for students. 
      Create a highly detailed, student-friendly learning roadmap for: ${skill}. 
      
      Structure your response as follows:
      1. **Overview**: Why this skill is exciting and important in 2026.
      2. **Prerequisites**: What you should know before starting.
      3. **Phase 1-3**: A step-by-step guide with specific topics and recommended free resources.
      4. **Job Market Insight**: Show current salary ranges and top companies hiring for this skill.
      5. **Pro Tip**: A unique piece of advice for mastering this skill.
      
      Use a warm, approachable tone. Use emojis to make it engaging.`);
  });

  if (result) setInCache(cacheKey, result);
  return result;
};

export const generateModuleContent = async (moduleTitle: string) => {
  const cacheKey = `module_content_${moduleTitle.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = getFromCache(cacheKey);
  if (cached) return JSON.parse(cached);

  const result = await callWithRetry(async () => {
    const content = await callASI(`Generate a professional, highly interactive 10-page technical curriculum for the topic: "${moduleTitle}".
      
      Guidelines for Content:
      1. Use Markdown formatting extensively (headers, bold text, code blocks).
      2. Use bullet points and numbered lists to break down complex information.
      3. Incorporate relevant emojis to make the content engaging and interactive.
      4. Ensure the content is "production-ready", highly detailed, and follows industry best practices.
      5. Each page must be a deep dive into a specific sub-topic.
      6. At least 10 pages are required.
      
      Format the output as a JSON object with a "pages" array. Each page object must have "title" and "content" (Markdown string).`, true);
    return content;
  });

  if (result) {
    setInCache(cacheKey, result);
    return JSON.parse(result);
  }
  return { pages: [] };
};

export const getRecommendedSkills = async () => {
  const cacheKey = "recommended_skills";
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const result = await callWithRetry(async () => {
      return await callASI(`Act as a career counselor for students. 
        What are the top 5 most exciting and in-demand tech skills for students to learn in 2026? 
        For each skill:
        - Give it a catchy title.
        - Explain why it's trending using current job market data.
        - Mention one "cool" project a student could build with it.
        
        Format with clear headings and bullet points.`);
    });

    if (result) setInCache(cacheKey, result);
    return result;
  } catch (error) {
    console.warn("ASI One API failed, using fallback data:", error);
    const fallback = `### 🚀 Top Trending Skills for 2026 (Offline Mode)

1. **Agentic AI Engineering**
   - **Why it's trending**: Companies are moving from basic chatbots to autonomous agents that can perform complex tasks.
   - **Cool Project**: Build a personal travel agent that books flights and hotels autonomously.

2. **Rust for Systems Programming**
   - **Why it's trending**: Memory safety and performance are critical for modern cloud infrastructure and high-performance apps.
   - **Cool Project**: Create a high-speed web server or a blockchain prototype.

3. **Next.js 15 & Server Components**
   - **Why it's trending**: The standard for modern web development, focusing on speed and developer experience.
   - **Cool Project**: A real-time collaborative dashboard with zero-latency updates.

4. **Cybersecurity & Ethical Hacking**
   - **Why it's trending**: With AI-driven threats, the demand for security experts has reached an all-time high.
   - **Cool Project**: Build a vulnerability scanner for common web exploits.

5. **Sustainable Tech & Green Coding**
   - **Why it's trending**: Optimizing code for energy efficiency is becoming a core requirement for large-scale systems.
   - **Cool Project**: An app that tracks and optimizes the carbon footprint of cloud deployments.`;
    return fallback;
  }
};
