/**
 * Format date string (YYYY-MM-DD) into a nice readable format (e.g. Jul 19, 2026)
 * using UTC to avoid local timezone offset shifting.
 */
export const formatTodoDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Check if a task is overdue (due date is in the past, and not completed).
 */
export const isTodoOverdue = (dueDate, completed) => {
  if (!dueDate || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Group and sort todos chronologically by day
 */
export const getGroupedTodos = (todos) => {
  const groups = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  todos.forEach((todo) => {
    let key;
    let label;
    let sortVal;

    if (!todo.dueDate) {
      key = 'no-due-date';
      label = 'No Due Date';
      sortVal = 9999999999999;
    } else {
      const due = new Date(todo.dueDate);
      due.setHours(0, 0, 0, 0);

      const dueTime = due.getTime();
      const todayTime = today.getTime();
      const tomorrowTime = tomorrow.getTime();

      if (dueTime < todayTime && !todo.completed) {
        key = 'overdue';
        label = 'Overdue';
        sortVal = 0;
      } else if (dueTime === todayTime) {
        key = 'today';
        label = 'Today';
        sortVal = todayTime;
      } else if (dueTime === tomorrowTime) {
        key = 'tomorrow';
        label = 'Tomorrow';
        sortVal = tomorrowTime;
      } else {
        key = todo.dueDate;
        label = due.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        });
        sortVal = dueTime;
      }
    }

    if (!groups[key]) {
      groups[key] = {
        key,
        label,
        sortVal,
        todos: [],
      };
    }
    groups[key].todos.push(todo);
  });

  return Object.values(groups).sort((a, b) => a.sortVal - b.sortVal);
};
