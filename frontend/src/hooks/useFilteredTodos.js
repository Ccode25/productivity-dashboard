import { useState, useMemo } from 'react';

export const useFilteredTodos = (todos) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = !todo.completed;
      if (statusFilter === 'completed') matchesStatus = todo.completed;
      
      let matchesCategory = true;
      if (categoryFilter !== 'All') {
        matchesCategory = todo.category.toLowerCase() === categoryFilter.toLowerCase();
      }
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [todos, searchQuery, statusFilter, categoryFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    filteredTodos
  };
};
