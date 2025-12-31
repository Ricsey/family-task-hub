import { HttpService } from '@/common/services/httpService';

type Category = string;

class CategoryService extends HttpService<Category> {
  constructor() {
    super('/tasks/category');
  }
}

export const categoryService = new CategoryService();
