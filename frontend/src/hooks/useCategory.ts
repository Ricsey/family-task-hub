import { CanceledError } from '@/services/apiClient';
import categoryService from '@/services/categoryService';
import { useEffect, useState } from 'react';

type Category = string;

const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { request, cancel } = categoryService.getAll<Category>();
    request
      .then((res) => {
        setIsLoading(true);

        setCategories(res.data);
        console.log(res.data);

        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
        setIsLoading(false);
      });

    return () => cancel();
  }, []);

  return { categories, error, isLoading, setCategories };
};

export default useCategory;
