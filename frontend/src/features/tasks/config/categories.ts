const CATEGORY_CONFIG: Record<string, { color: string; icon?: string }> = {
  Chore: { color: '#0D9488' },
  Shopping: { color: '#E11D48' },
  Homework: { color: '#2563EB' },
  Other: { color: '#4B5563' },
} as const;

export const getCategoryColor = (name: string) =>
  CATEGORY_CONFIG[name]?.color ?? '#94a3b8'; // Default Slate-400
