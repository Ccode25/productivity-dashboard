// In-memory mock database store for Project Engineer handling construction documentation
let todos = [
  {
    id: '1',
    title: 'Submit Material Submittal for Structural Steel Coating',
    description: 'Prepare and transmit manufacturer technical data sheets, test certifications, and sample mockups to architectural consultant for review.',
    category: 'Submittals',
    dueDate: new Date().toISOString().split('T')[0], // today
    repeat: 'none',
    completed: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '2',
    title: 'Review Sector B Concrete Core Strength Test Reports',
    description: 'Analyze laboratory compressive strength logs for 7-day and 28-day concrete cures in gridlines E-K. Confirm compliance with ASTM standards.',
    category: 'Quality',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    repeat: 'none',
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Publish Daily Site Construction Activity Journal',
    description: 'Record daily weather conditions, trade headcount, equipment utilization, material deliveries, and documented progress photos.',
    category: 'Site Logs',
    dueDate: new Date().toISOString().split('T')[0], // today
    repeat: 'daily',
    completed: false,
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: '4',
    title: 'Log RFI for Foundation Level Piping Clash',
    description: 'Raise RFI to MEP consultant regarding piping clash between gravity drainage line and foundation beam #FB-12.',
    category: 'RFIs',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
    repeat: 'none',
    completed: true,
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: '5',
    title: 'Perform Weekly Site Safety Walkthrough and Safety Log',
    description: 'Inspect site scaffolding, personal protective equipment (PPE) compliance, and fire protection equipment. Upload audit sheet.',
    category: 'Safety',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0], // in 2 days
    repeat: 'weekly',
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// In-memory activity history log for Project Engineer
let history = [
  {
    id: 'h1',
    todoId: '4',
    action: 'created',
    todoTitle: 'Log RFI for Foundation Level Piping Clash',
    category: 'RFIs',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    details: 'RFI draft initialized regarding foundation clash'
  },
  {
    id: 'h2',
    todoId: '4',
    action: 'updated',
    todoTitle: 'Log RFI for Foundation Level Piping Clash',
    category: 'RFIs',
    timestamp: new Date(Date.now() - 129600000).toISOString(), // 1.5 days ago
    details: 'Piping shop drawings attached to RFI document'
  },
  {
    id: 'h3',
    todoId: '4',
    action: 'completed',
    todoTitle: 'Log RFI for Foundation Level Piping Clash',
    category: 'RFIs',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    details: 'RFI transmitted to structural and MEP consultants'
  },
  {
    id: 'h4',
    todoId: '1',
    action: 'created',
    todoTitle: 'Submit Material Submittal for Structural Steel Coating',
    category: 'Submittals',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    details: 'Submittal document compiled with technical data sheets'
  },
  {
    id: 'h5',
    todoId: '1',
    action: 'completed',
    todoTitle: 'Submit Material Submittal for Structural Steel Coating',
    category: 'Submittals',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    details: 'Transmitted package approved with comments by architectural consultant'
  },
  {
    id: 'h6',
    todoId: '2',
    action: 'created',
    todoTitle: 'Review Sector B Concrete Core Strength Test Reports',
    category: 'Quality',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    details: 'Strength reports received from testing laboratory and logged for review'
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
