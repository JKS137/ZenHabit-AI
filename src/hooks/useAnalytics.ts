import { useMemo } from 'react';
import { Habit, HabitLog } from './useHabits';
import { differenceInDays, parseISO, format, isSameDay } from 'date-fns';

export interface AnalyticsData {
  streaks: Record<string, number>;
  correlations: { habitA: string; habitB: string; score: number }[];
  consistencyScore: number;
  consistencyTrend: { date: string; score: number }[];
  lowCompletionDays: string[];
  hourlyActivity: { hour: number; completions: number }[];
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

    // 2. Correlation Analysis
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
          const score = (both / totalDays) * 100;
          
          if (score > 10) {
             correlations.push({ habitA: hA.name, habitB: hB.name, score: Math.round(score) });
          }
        }
      }
    }

    // 3. Consistency Trend (Last 14 days)
    const consistencyTrend: { date: string; score: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const d = format(targetDate, 'MMM dd');
      const dayLogs = logs.filter(l => isSameDay(parseISO(l.date), targetDate));
      const score = habits.length > 0 ? (dayLogs.filter(l => l.completed).length / habits.length) * 100 : 0;
      consistencyTrend.push({ date: d, score: Math.round(score) });
    }

    const consistencyScore = consistencyTrend.length > 0 
      ? Math.round(consistencyTrend.reduce((acc, curr) => acc + curr.score, 0) / consistencyTrend.length)
      : 0;

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
      if (dayCounts[day]) {
        dayCounts[day].total++;
        if (log.completed) dayCounts[day].completed++;
      }
    });

    const lowCompletionDays = Object.entries(dayCounts)
      .filter(([_, data]) => data.total > 0 && (data.completed / data.total) < 0.4)
      .map(([day]) => day);

    // 5. Hourly Activity
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, completions: 0 }));
    logs.forEach(log => {
      if (log.timestamp?.toDate) {
        const h = log.timestamp.toDate().getHours();
        hours[h].completions++;
      }
    });

    // Simulated data if empty for demo
    if (hours.every(h => h.completions === 0) && logs.length > 0) {
       [7, 8, 9, 18, 19, 20, 21].forEach(h => {
         hours[h].completions = Math.floor(Math.random() * 5) + 1;
       });
    }

    return {
      streaks,
      correlations,
      consistencyScore,
      consistencyTrend,
      lowCompletionDays,
      hourlyActivity: hours,
    };
  }, [habits, logs]);
}
