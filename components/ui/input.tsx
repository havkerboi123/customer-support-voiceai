import * as React from 'react';
import { cn } from '@/lib/shadcn/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 ring-1 placeholder:text-gray-400 focus:border-gray-900 focus:ring-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
