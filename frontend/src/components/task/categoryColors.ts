type CategoryColor = {
  border: string;
  background: string;
  text: string;
};

const CATEGORY_COLORS: Record<string, CategoryColor> = {
  Work: {
    border: 'border-l-blue-500',
    background: 'bg-blue-100',
    text: 'text-blue-800',
  },
  Personal: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-800',
  },
};

const DEFAULT_COLOR: CategoryColor = {
  border: 'border-l-gray-300',
  background: 'bg-gray-100',
  text: 'text-gray-800',
};

export const getCategoryColors = (categoryName: string): CategoryColor => {
  const color = CATEGORY_COLORS[categoryName];

  if (!color) {
    console.warn(
      `Category colort not found for: ${categoryName}. Using default colors.`
    );
    return DEFAULT_COLOR;
  }

  return color;
};
