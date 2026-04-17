import { useState, useEffect } from 'react';
import { Habit } from './useHabits';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Recommendation {
  id: string;
  name: string;
  reason: string;
  category: string;
}

export function useRecommendations(habits: Habit[], userProfile: any) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!process.env.GEMINI_API_KEY) return;
    setLoading(true);
    try {
      const model = "gemini-1.5-flash";
      
      const prompt = `
        As an AI Habit Coach, analyze this user's profile and existing habits:
        User Name: ${userProfile?.name}
        Existing Habits: ${habits.map(h => h.name).join(', ')}
        
        Suggest 3 new, relevant habits that would complement their current routine.
        For each, provide:
        1. Habit Name
        2. Reason for recommendation (Behavioral science based)
        3. Category (Fitness, Mindfulness, Productivity, Health)
        
        Return ONLY a JSON array of objects with keys: name, reason, category.
      `;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const parsed = JSON.parse(result.text || '[]');
      
      setRecommendations(parsed.map((r: any, i: number) => ({ ...r, id: `rec-${i}` })));
    } catch (error) {
       console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (habits.length > 0) {
      fetchRecommendations();
    }
  }, [habits.length]);

  return { recommendations, loading, refresh: fetchRecommendations };
}
