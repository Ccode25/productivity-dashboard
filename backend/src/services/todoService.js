const todoModel = require('../models/todoModel');
const diffUtils = require('../utils/diffUtils');

/**
 * Add an event log to the history_logs
 */
const addHistoryLog = async (userId, action, todo, details = '', changes = []) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const todoTitle = todo.title || todo.title;
  const category = todo.category || 'Other';
  const timestamp = new Date().toISOString();
  const logDetails = details || `Task ${action}`;
  const changesJson = JSON.stringify(changes);
  
  const snapshotJson = (action === 'completed') ? JSON.stringify({
    priority: todo.priority || 'medium',
    status: 'Completed',
    description: todo.description || ''
  }) : null;

  await todoModel.addHistoryLog(
    id, userId, todo.id, action, todoTitle, category, timestamp, logDetails, changesJson, snapshotJson
  );
};

const createTodo = async (userId, todoData) => {
  const { title, description, category, dueDate, priority, repeat } = todoData;
  const id = Date.now().toString();
  const cleanTitle = title.trim();
  const cleanDesc = (description || '').trim();
  const cleanCat = (category || 'Other').trim();
  const due = dueDate || '';
  const prio = priority || 'medium';
  const rep = repeat || 'none';
  const createdAt = new Date().toISOString();

  const newTodo = await todoModel.create({
    id,
    userId,
    title: cleanTitle,
    description: cleanDesc,
    category: cleanCat,
    dueDate: due,
    priority: prio,
    repeat: rep,
    completed: false,
    createdAt
  });

  const dueInfo = newTodo.dueDate ? `, Due: ${newTodo.dueDate}` : '';
  const prioInfo = `, Priority: ${newTodo.priority || 'medium'}`;
  await addHistoryLog(userId, 'created', newTodo, `Task created under category "${newTodo.category}"${prioInfo}${dueInfo}`);
  
  return newTodo;
};

const updateTodo = async (userId, id, todoData) => {
  const existingTodo = await todoModel.findById(userId, id);
  if (!existingTodo) return null;

  const { title, description, category, dueDate, priority, completed, repeat } = todoData;

  const updatedTitle = title !== undefined ? title.trim() : existingTodo.title;
  const updatedDesc = description !== undefined ? description.trim() : existingTodo.description;
  const updatedCat = category !== undefined ? category.trim() : existingTodo.category;
  const updatedDue = dueDate !== undefined ? dueDate : existingTodo.dueDate;
  const updatedPrio = priority !== undefined ? priority : existingTodo.priority;
  const updatedCompleted = completed !== undefined ? Boolean(completed) : existingTodo.completed;
  const updatedRepeat = repeat !== undefined ? repeat : existingTodo.repeat;

  let newRecurringTodo = null;

  if (updatedCompleted && !existingTodo.completed && updatedRepeat && updatedRepeat !== 'none') {
    const baseDate = updatedDue ? new Date(updatedDue) : new Date();
    const nextDate = new Date(baseDate);
    
    if (updatedRepeat === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (updatedRepeat === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    
    const nextDateStr = nextDate.toISOString().split('T')[0];
    const newId = (Date.now() + 1).toString();
    const createdAt = new Date().toISOString();

    newRecurringTodo = await todoModel.create({
      id: newId,
      userId,
      title: updatedTitle,
      description: updatedDesc,
      category: updatedCat,
      dueDate: nextDateStr,
      priority: updatedPrio,
      repeat: updatedRepeat,
      completed: false,
      createdAt
    });
  }

  const updatedTodo = await todoModel.update(userId, id, {
    title: updatedTitle,
    description: updatedDesc,
    category: updatedCat,
    dueDate: updatedDue,
    priority: updatedPrio,
    repeat: updatedRepeat,
    completed: updatedCompleted
  });

  const changes = diffUtils.getTodoChanges(existingTodo, updatedTodo);

  if (updatedTodo.completed && !existingTodo.completed) {
    await addHistoryLog(userId, 'completed', updatedTodo, `Task completed`, changes);
  } else if (!updatedTodo.completed && existingTodo.completed) {
    await addHistoryLog(userId, 'reopened', updatedTodo, 'Task reopened', changes);
  } else if (changes.length > 0) {
    await addHistoryLog(userId, 'updated', updatedTodo, `Task details updated`, changes);
  }

  if (newRecurringTodo) {
    await addHistoryLog(userId, 'created', newRecurringTodo, `Next recurring occurrence automatically scheduled (Due: ${newRecurringTodo.dueDate})`, []);
  }

  return {
    updatedTodo,
    createdRecurring: newRecurringTodo
  };
};

const deleteTodo = async (userId, id) => {
  const existingTodo = await todoModel.findById(userId, id);
  if (!existingTodo) return false;

  await todoModel.remove(userId, id);
  
  const dueInfo = existingTodo.dueDate ? `, Due: ${existingTodo.dueDate}` : '';
  const prioInfo = `, Priority: ${existingTodo.priority || 'medium'}`;
  await addHistoryLog(userId, 'deleted', existingTodo, `Task deleted from board (Category: ${existingTodo.category}${prioInfo}${dueInfo})`);
  
  return true;
};

module.exports = {
  createTodo,
  updateTodo,
  deleteTodo
};
