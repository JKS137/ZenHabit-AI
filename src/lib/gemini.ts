import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HabitInsight {
  analysis: string;
  suggestion: string;
  intensityChange?: 'increase' | 'reduce' | 'stay';
}

export async function getHabitInsights(habitName: string, logs: { date: string, completed: boolean }[]): Promise<HabitInsight> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze this habit tracking data and provide coaching insights.
    Habit: ${habitName}
    Logs (last 30 days): ${JSON.stringify(logs)}

    Based on the behavior (completion rates, frequency, patterns), provide:
    1. A brief analysis of the user's consistency.
    2. An adaptive suggestion (e.g., if struggling, suggest reducing difficulty. If consistent, suggest increasing intensity).
    3. A clear intensity adjustment recommendation.

    Respond in JSON format:
    {
      "analysis": "...",
      "suggestion": "...",
      "intensityChange": "increase" | "reduce" | "stay"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      analysis: result.analysis || "Keep going! Consistency is key.",
      suggestion: result.suggestion || "Try to log your habits daily at the same time.",
      intensityChange: result.intensityChange || "stay"
    };
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      analysis: "Unable to analyze patterns at this time.",
      suggestion: "Maintain your current pace and keep logging data.",
      intensityChange: "stay"
    };
  }
}
