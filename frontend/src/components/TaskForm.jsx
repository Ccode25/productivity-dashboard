import React, { useState, useEffect } from 'react';
import { InputField, TextAreaField, SelectField } from './common/FormField';

const CATEGORIES = ['Work', 'Personal', 'Design', 'Health', 'Other'];

export default function TaskForm({ onSubmit, todoToEdit, onCancelEdit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [repeat, setRepeat] = useState('none');
  const [error, setError] = useState('');

  // Pre-fill form when editing a todo
  useEffect(() => {
    if (todoToEdit) {
      setTitle(todoToEdit.title);
      setDescription(todoToEdit.description || '');
      setCategory(todoToEdit.category || 'Work');
      setDueDate(todoToEdit.dueDate || '');
      setPriority(todoToEdit.priority || 'medium');
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
    setPriority('medium');
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
      priority,
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

      <InputField
        id="title-input"
        label="Task Title *"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
      />

      <TextAreaField
        id="desc-input"
        label="Description"
        placeholder="Add details about this task..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-row">
        <SelectField
          id="category-select"
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
        />

        <InputField
          id="date-input"
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <SelectField
          id="priority-select"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]}
        />

        <SelectField
          id="repeat-select"
          label="Repeat"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' }
          ]}
        />
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
