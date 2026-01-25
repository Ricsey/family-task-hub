import { useMemo } from 'react';
import type { Task } from '../types';

export interface Filters {
  searchQuery: string;
  category: string;
  assignee: string;
  sortBy: 'dueDate' | 'title';
}

export const INITIAL_FILTERS = {
  searchQuery: '',
  category: 'all',
  assignee: 'all',
  sortBy: 'dueDate',
} as Filters;

export const useFilterTasks = (tasks: Task[], filters: Filters) => {

  const isDirty = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.category !== 'all' ||
      filters.assignee !== 'all'
    );
  }, [filters]);

  const filteredTasks = useMemo(() => {
    const searchQuery = filters.searchQuery.trim();

    const processed = tasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        `${t.title} ${t.description ?? ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        filters.category === 'all' || t.category === filters.category;
      const matchesUser =
        filters.assignee === 'all' || t.assignee === filters.assignee;

      return matchesSearch && matchesCat && matchesUser;
    });

    if (filters.sortBy === 'dueDate') {
      return [...processed].sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    }

    return [...processed].sort((a, b) => a.title.localeCompare(b.title));
  }, [tasks, filters]);

  return {isDirty, filteredTasks};
};
