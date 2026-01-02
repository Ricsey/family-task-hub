import { useMemo } from "react";
import type { Task } from "../types";

export interface Filters {
  searchQuery: string;
  category: string;
  assignee: string;
  sortBy: 'dueDate' | 'title';
}


export const useFilterTasks = (tasks: Task[], filters: Filters) => {
  return useMemo(() => {

    const searchQuery = filters.searchQuery.trim();

    const processed = tasks.filter((t) => {
      const matchesSearch = !searchQuery ||
        `${t.title} ${t.description ?? ''}`.toLowerCase().includes(searchQuery);
      const matchesCat = filters.category === 'all' || t.category === filters.category;
      const matchesUser = filters.assignee === 'all' || t.assignee === filters.assignee;

      return matchesSearch && matchesCat && matchesUser;
    });

    if (filters.sortBy === 'dueDate') {
      return [...processed].sort((a, b) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
    }

    return [...processed].sort((a, b) => a.title.localeCompare(b.title));
  }, [tasks, filters])
}
