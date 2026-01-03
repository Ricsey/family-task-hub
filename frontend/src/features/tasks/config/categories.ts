const CATEGORY_CONFIG: Record<string, { text: string; bg: string, full: string, border: string, progress: string }> = {
  Chore: { text: 'text-teal-700', bg: 'bg-teal-100', full: 'bg-teal-500', border:  'border-l-teal-500'   , progress: '[&>div]:bg-teal-500' },
  Shopping: { text: 'text-rose-700', bg: 'bg-rose-100', full: 'bg-rose-500', border: 'border-l-rose-500' , progress: '[&>div]:bg-rose-500' },
  Homework: { text: 'text-blue-700', bg: 'bg-blue-100', full: 'bg-blue-500', border: 'border-l-blue-500' , progress: '[&>div]:bg-blue-500' },
  Other: { text: 'text-slate-700', bg: 'bg-slate-100', full: 'bg-slate-500', border: 'border-l-slate-500', progress: '[&>div]:bg-slate-500' },
} as const;

//TODO: rename function to getCategoryStyles
export const getCategoryColor = (name: string) =>
  CATEGORY_CONFIG[name]
