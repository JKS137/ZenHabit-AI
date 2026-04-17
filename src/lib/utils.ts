import { format, startOfToday, eachDayOfInterval, subDays, isSameDay } from 'date-fns';

export function getHabitCompletionData(logs: any[], days = 7) {
  const today = startOfToday();
  const interval = eachDayOfInterval({
    start: subDays(today, days - 1),
    end: today
  });

  return interval.map(date => {
    const log = logs.find(l => isSameDay(new Date(l.date), date));
    return {
      date: format(date, 'MMM dd'),
      completed: log ? log.completed : false,
      value: log ? log.value : 0
    };
  });
}

export const BADGES = {
  STREAK_7: "7-Day Warrior",
  STREAK_30: "Monthly Master",
  HYDRATION_CHAMP: "Hydration Hero",
  PRAYER_POW: "Spiritual Sustenance"
};
