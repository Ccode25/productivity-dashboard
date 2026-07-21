import { useMemo } from 'react';
import {
  calculateStreak,
  calculateWeeklyTrend,
  calculateCategoryStats,
  calculateOverdueCount,
  calculateProductivityScore,
  getScoreFeedback
} from '../utils/productivity';

/**
 * ViewModel hook for Productivity statistics calculation.
 * Encapsulates calculation rules and memoizes outcomes based on task data.
 */
export function useProductivityStats(todos = []) {
  return useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;

    const streak = calculateStreak(todos);
    const trendData = calculateWeeklyTrend(todos);
    const { categoryStats, topCategory, categories } = calculateCategoryStats(todos);
    const overdueCount = calculateOverdueCount(todos);
    
    const score = calculateProductivityScore(todos, streak, overdueCount);
    const feedback = getScoreFeedback(score);

    return {
      completed,
      streak,
      trendData,
      categoryStats,
      topCategory,
      categories,
      overdueCount,
      score,
      feedbackText: feedback.text,
      feedbackColor: feedback.color
    };
  }, [todos]);
}

export default useProductivityStats;
