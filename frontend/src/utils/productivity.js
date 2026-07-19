/**
 * Productivity stats calculations and analytics model
 */

/**
 * Calculates current completion streak in consecutive days
 */
export const calculateStreak = (todos) => {
  const completedTodos = todos.filter((t) => t.completed);
  const completedDates = new Set(
    completedTodos
      .map((t) => t.dueDate || (t.createdAt && t.createdAt.split('T')[0]))
      .filter(Boolean)
  );

  let streak = 0;
  const checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  const todayStr = checkDate.toLocaleDateString('en-CA');
  const completedToday = completedDates.has(todayStr);

  if (completedToday) {
    streak = 1;
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = checkDate.toLocaleDateString('en-CA');
      if (completedDates.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toLocaleDateString('en-CA');
    if (completedDates.has(yesterdayStr)) {
      streak = 1;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toLocaleDateString('en-CA');
        if (completedDates.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
  }
  return streak;
};

/**
 * Calculates weekly completions count for the last 7 days
 */
export const calculateWeeklyTrend = (todos) => {
  const completedTodos = todos.filter((t) => t.completed);
  const trend = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const count = completedTodos.filter((t) => {
      const taskDate = t.dueDate || (t.createdAt && t.createdAt.split('T')[0]);
      return taskDate === dateStr;
    }).length;

    trend.push({ dayLabel, formatted, count });
  }
  return trend;
};

/**
 * Calculates allocations statistics across categories
 */
export const calculateCategoryStats = (todos) => {
  const completedTodos = todos.filter((t) => t.completed);
  const categoryStats = {};
  const categories = ['Work', 'Personal', 'Design', 'Health', 'Other'];
  
  categories.forEach((cat) => {
    categoryStats[cat] = 0;
  });

  completedTodos.forEach((t) => {
    const cat = t.category || 'Other';
    const normalizedCat = categories.includes(cat) ? cat : 'Other';
    categoryStats[normalizedCat] = (categoryStats[normalizedCat] || 0) + 1;
  });

  let topCategory = 'None';
  let maxCatCount = 0;
  Object.entries(categoryStats).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });

  return { categoryStats, topCategory, categories };
};

/**
 * Counts overdue pending tasks
 */
export const calculateOverdueCount = (todos) => {
  return todos.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;
};

/**
 * Calculates numeric focus score based on completion rates, streaks, and overdue deductions
 */
export const calculateProductivityScore = (todos, streak, overdueCount) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;

  const overallWeight = total > 0 ? (completed / total) * 40 : 0;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayTodos = todos.filter((t) => t.dueDate === todayStr);
  const todayTotal = todayTodos.length;
  const todayCompleted = todayTodos.filter((t) => t.completed).length;
  const todayWeight = todayTotal > 0 ? (todayCompleted / todayTotal) * 40 : 40;

  const streakWeight = Math.min(streak * 5, 20);
  const deduction = overdueCount * 5;

  let score = Math.round(overallWeight + todayWeight + streakWeight - deduction);
  return Math.max(0, Math.min(100, score));
};

/**
 * Returns focus feedback text and color based on score level
 */
export const getScoreFeedback = (score) => {
  if (score >= 80) {
    return {
      text: 'Exceptional focus! You are operating in flow state.',
      color: '#10b981'
    };
  }
  if (score >= 50) {
    return {
      text: 'Good progress. Clear overdue items to boost your focus score.',
      color: 'hsl(var(--warning))'
    };
  }
  return {
    text: 'Keep going! Focus on completing your daily list.',
    color: 'hsl(var(--text-secondary))'
  };
};
