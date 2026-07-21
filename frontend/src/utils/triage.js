export const getMostImportantTask = (todos) => {
  const activeTodos = todos.filter(t => !t.completed);
  if (activeTodos.length === 0) return null;

  const todayStr = new Date().toLocaleDateString('en-CA');
  
  // Priorities logic: High > Medium > Low
  const getPriorityScore = (prio) => {
    if (prio === 'high') return 3;
    if (prio === 'medium') return 2;
    return 1;
  };

  // Calculate urgency score for each task
  const scoredTodos = activeTodos.map(todo => {
    let score = 0;
    score += getPriorityScore(todo.priority) * 10; // priority is weighted heavily

    if (todo.dueDate) {
      if (todo.dueDate < todayStr) {
        score += 20; // Overdue is extremely urgent
      } else if (todo.dueDate === todayStr) {
        score += 15; // Due today is very urgent
      }
    }

    return { ...todo, triageScore: score };
  });

  // Sort by triageScore descending, then by creation date ascending (oldest first)
  scoredTodos.sort((a, b) => {
    if (b.triageScore !== a.triageScore) {
      return b.triageScore - a.triageScore;
    }
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return scoredTodos[0];
};
