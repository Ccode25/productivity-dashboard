import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Work', 'Personal', 'Design', 'Health', 'Other'];

export default function TaskForm({ onSubmit, todoToEdit, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');

  // Pre-fill form when editing a todo
  useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description || '');
      setCategory(todoToEdit.category || 'Work');
      setDueDate(todoToEdit.dueDate || '');
      setRepeat(todoToEdit.repeat || 'none');
    } else {
      resetForm();
    }
  }, [todoToEdit]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Work');
    setDueDate('');
    setRepeat('none');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      category,
      dueDate,
      repeat,
    };

    onSubmit(taskData);
    resetForm();
  };

  return (
    <form className="glass-panel form-group" onSubmit={handleSubmit} style={{ gap: '1.25rem' }}>
      <h3 className="form-label" style={{ fontSize: '1.15rem', color: 'white', marginBottom: '0.25rem' }}>
        {todoToEdit ? 'Edit Task' : 'Add New Task'}
      </h3>

      <div className="form-group">
        <label className="form-label" htmlFor="title-input">Task Title *</label>
        <input
          id="title-input"
          type="text"
          className="input-field"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {error && <span style={{ color: 'hsl(var(--danger))', fontSize: '0.8rem', fontWeight: 500 }}>{error}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="desc-input">Description</label>
        <textarea
          id="desc-input"
          className="input-field"
          placeholder="Add details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="category-select">Category</label>
          <select
            id="category-select"
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date-input">Due Date</label>
          <input
            id="date-input"
            type="date"
            className="input-field"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="repeat-select">Repeat</label>
          <select
            id="repeat-select"
            className="input-field"
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {todoToEdit ? 'Save Changes' : 'Add Task'}
        </button>
        
        {todoToEdit && (
          <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
