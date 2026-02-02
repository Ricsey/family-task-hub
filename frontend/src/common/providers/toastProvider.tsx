import { useTheme } from '@/components/providers/theme-provider';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return <Toaster position="bottom-right" closeButton theme={resolvedTheme} />;
}
