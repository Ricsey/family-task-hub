import { useQuery } from "@tanstack/react-query";
import { categoryService } from "../services/categoryService";

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
