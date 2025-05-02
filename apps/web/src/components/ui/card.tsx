import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('bg-white rounded-lg border shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export { Card }; 