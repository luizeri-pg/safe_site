import { cn } from '@/lib/utils';

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  /** Largura máxima do conteúdo (padrão: 6xl) */
  maxWidth?: '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const maxWidthClass = {
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
} as const;

export function PageContent({ children, className, maxWidth = '6xl' }: PageContentProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-full px-4 py-6 sm:px-6',
        maxWidthClass[maxWidth],
        'space-y-6',
        className
      )}
    >
      {children}
    </div>
  );
}
