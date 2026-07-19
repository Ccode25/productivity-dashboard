// In-memory mock database store
let todos = [
  {
    id: '1',
    title: 'Design Premium UI',
    description: 'Implement a glassmorphic dark theme dashboard with custom animations and harmonious HSL gradients.',
    category: 'Design',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    repeat: 'daily',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: '2',
    title: 'Setup Express Backend',
    description: 'Build robust RESTful API endpoints for CRUD operations with robust data validation.',
    category: 'Work',
    dueDate: new Date().toISOString().split('T')[0], // today
    repeat: 'none',
    completed: false,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '3',
    title: 'Build React Frontend',
    description: 'Create the interactive UI components, integrate fetch requests, and display nice toast notifications.',
    category: 'Work',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Read scientific literature',
    description: 'Take a breaks and review interesting papers on bioRxiv.',
    category: 'Personal',
    dueDate: '',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// In-memory activity history log
let history = [
  {
    id: 'h1',
    todoId: '1',
    action: 'created',
    todoTitle: 'Design Premium UI',
    category: 'Design',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    details: 'Task created under category Design'
  },
  {
    id: 'h2',
    todoId: '1',
    action: 'completed',
    todoTitle: 'Design Premium UI',
    category: 'Design',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    details: 'Task marked as completed'
  },
  {
    id: 'h3',
    todoId: '2',
    action: 'created',
    todoTitle: 'Setup Express Backend',
    category: 'Work',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    details: 'Task created under category Work'
  }
];

/**
 * Add an event log to the history timeline
 */
const addHistoryLog = (action, todo, details = '') => {
  history.unshift({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    todoId: todo.id,
    action,
    todoTitle: todo.title,
    category: todo.category || 'Other',
    timestamp: new Date().toISOString(),
    details: details || `Task ${action}`
  });
};

/**
 * Find all todos
 */
const findAll = async () => {
  return todos;
};

/**
 * Find a todo by ID
 */
const findById = async (id) => {
  return todos.find((t) => t.id === id);
};

/**
 * Get all history logs
 */
const getHistory = async () => {
  return history;
};

/**
 * Clear history logs
 */
const clearHistory = async () => {
  history = [];
  return true;
};

/**
 * Create a new todo
 */
const create = async (todoData) => {
  const { title, description, category, dueDate, repeat } = todoData;
  const newTodo = {
    id: Date.now().toString(),
    title: title.trim(),
    description: (description || '').trim(),
    category: (category || 'Other').trim(),
    dueDate: dueDate || '',
    repeat: repeat || 'none',
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  addHistoryLog('created', newTodo, `Task created under category ${newTodo.category}`);
  return newTodo;
};

/**
 * Update a todo.
 * Also handles automatic cloning of recurring tasks if completed is transitioned to true.
 */
const update = async (id, todoData) => {
  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex === -1) return null;

  const existingTodo = todos[todoIndex];
  
  const { title, description, category, dueDate, completed, repeat } = todoData;

  const updatedTodo = {
    ...existingTodo,
    title: title !== undefined ? title.trim() : existingTodo.title,
    description: description !== undefined ? description.trim() : existingTodo.description,
    category: category !== undefined ? category.trim() : existingTodo.category,
    dueDate: dueDate !== undefined ? dueDate : existingTodo.dueDate,
    completed: completed !== undefined ? Boolean(completed) : existingTodo.completed,
    repeat: repeat !== undefined ? repeat : existingTodo.repeat
  };

  let newRecurringTodo = null;

  // Schedule next recurring occurrence if checked off
  if (updatedTodo.completed && !existingTodo.completed && updatedTodo.repeat && updatedTodo.repeat !== 'none') {
    const baseDate = updatedTodo.dueDate ? new Date(updatedTodo.dueDate) : new Date();
    const nextDate = new Date(baseDate);
    
    if (updatedTodo.repeat === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (updatedTodo.repeat === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    
    const nextDateStr = nextDate.toISOString().split('T')[0];
    newRecurringTodo = {
      id: (Date.now() + 1).toString(),
      title: updatedTodo.title,
      description: updatedTodo.description,
      category: updatedTodo.category,
      dueDate: nextDateStr,
      repeat: updatedTodo.repeat,
      completed: false,
      createdAt: new Date().toISOString()
    };
  }

  todos[todoIndex] = updatedTodo;

  // Log completion/reopen/update status
  if (updatedTodo.completed && !existingTodo.completed) {
    addHistoryLog('completed', updatedTodo, 'Task marked as completed');
  } else if (!updatedTodo.completed && existingTodo.completed) {
    addHistoryLog('reopened', updatedTodo, 'Task reopened');
  } else {
    addHistoryLog('updated', updatedTodo, 'Task details updated');
  }

  // Unshift new recurring todo after saving updatedTodo to avoid index-shift issues
  if (newRecurringTodo) {
    todos.unshift(newRecurringTodo);
    addHistoryLog('created', newRecurringTodo, `Next recurring occurrence automatically scheduled (Due: ${newRecurringTodo.dueDate})`);
  }

  return {
    updatedTodo,
    createdRecurring: newRecurringTodo
  };
};

/**
 * Delete a todo
 */
const remove = async (id) => {
  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex === -1) return false;

  const todo = todos[todoIndex];
  todos.splice(todoIndex, 1);
  addHistoryLog('deleted', todo, 'Task deleted from board');
  return true;
};

module.exports = {
  findAll,
  findById,
  getHistory,
  clearHistory,
  create,
  update,
  remove
};
