/**
 * Compares two objects and returns an array of changes.
 * Specifically tailored for Todo fields.
 */
const getTodoChanges = (existingTodo, updatedTodo) => {
  const changes = [];
  
  if (updatedTodo.title !== existingTodo.title) {
    changes.push({ field: 'Title', old: existingTodo.title, new: updatedTodo.title });
  }
  if (updatedTodo.description !== existingTodo.description) {
    changes.push({ field: 'Description', old: existingTodo.description, new: updatedTodo.description });
  }
  if (updatedTodo.category !== existingTodo.category) {
    changes.push({ field: 'Category', old: existingTodo.category, new: updatedTodo.category });
  }
  if (updatedTodo.dueDate !== existingTodo.dueDate) {
    changes.push({ field: 'Due Date', old: existingTodo.dueDate, new: updatedTodo.dueDate });
  }
  if (updatedTodo.priority !== existingTodo.priority) {
    changes.push({ field: 'Priority', old: existingTodo.priority, new: updatedTodo.priority });
  }
  if (updatedTodo.repeat !== existingTodo.repeat) {
    changes.push({ field: 'Repeat', old: existingTodo.repeat, new: updatedTodo.repeat });
  }

  return changes;
};

module.exports = {
  getTodoChanges
};
