import { useMemo } from 'react';
import { Habit, HabitLog } from './useHabits';
import { differenceInDays, parseISO, format, isSameDay } from 'date-fns';

export interface AnalyticsData {
  streaks: Record<string, number>;
  correlations: { habitA: string; habitB: string; score: number }[];
  consistencyScore: number;
  lowCompletionDays: string[];
  hourlyActivity: Record<number, number>;
}

export function useAnalytics(habits: Habit[], logs: HabitLog[]) {
  return useMemo(() => {
    // 1. Longest Streaks
    const streaks: Record<string, number> = {};
    habits.forEach(habit => {
      const habitLogs = logs
        .filter(l => l.habitId === habit.id && l.completed)
        .sort((a, b) => b.date.localeCompare(a.date));

      let currentStreak = 0;
      let lastDate = new Date();
      
      for (let i = 0; i < habitLogs.length; i++) {
        const logDate = parseISO(habitLogs[i].date);
        const diff = differenceInDays(lastDate, logDate);
        
        if (i === 0) {
          if (diff <= 1) currentStreak = 1;
          else break;
        } else {
          if (diff === 1) currentStreak++;
          else break;
        }
        lastDate = logDate;
      }
      streaks[habit.id] = currentStreak;
    });

    // 2. Correlation Analysis (Simple Co-occurrence)
    const correlations: { habitA: string; habitB: string; score: number }[] = [];
    if (habits.length > 1) {
      for (let i = 0; i < habits.length; i++) {
        for (let j = i + 1; j < habits.length; j++) {
          const hA = habits[i];
          const hB = habits[j];
          
          const logsA = new Set(logs.filter(l => l.habitId === hA.id && l.completed).map(l => l.date));
          const logsB = new Set(logs.filter(l => l.habitId === hB.id && l.completed).map(l => l.date));
          
          let both = 0;
          logsA.forEach(date => { if (logsB.has(date)) both++; });
          
          const totalDays = new Set(logs.map(l => l.date)).size || 1;
          const score = (both / totalDays) * 100; // Simplified correlation
          
          if (score > 10) {
             correlations.push({ habitA: hA.name, habitB: hB.name, score: Math.round(score) });
          }
        }
      }
    }

    // 3. Consistency Score (last 30 days)
    const thirtyDaysAgo = differenceInDays(new Date(), 30);
    const recentLogs = logs.filter(l => differenceInDays(new Date(), parseISO(l.date)) <= 30);
    const completedCount = recentLogs.filter(l => l.completed).length;
    const totalPossible = habits.length * 30;
    const consistencyScore = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;

    // 4. Low Completion Days
    const dayCounts: Record<string, { total: number; completed: number }> = {
      'Monday': { total: 0, completed: 0 },
      'Tuesday': { total: 0, completed: 0 },
      'Wednesday': { total: 0, completed: 0 },
      'Thursday': { total: 0, completed: 0 },
      'Friday': { total: 0, completed: 0 },
      'Saturday': { total: 0, completed: 0 },
      'Sunday': { total: 0, completed: 0 },
    };

    logs.forEach(log => {
      const day = format(parseISO(log.date), 'EEEE');
      dayCounts[day].total++;
      if (log.completed) dayCounts[day].completed++;
    });

    const lowCompletionDays = Object.entries(dayCounts)
      .filter(([_, data]) => data.total > 0 && (data.completed / data.total) < 0.5)
      .map(([day]) => day);

    return {
      streaks,
      correlations,
      consistencyScore,
      lowCompletionDays,
      hourlyActivity: {}, 
    };
  }, [habits, logs]);
}
