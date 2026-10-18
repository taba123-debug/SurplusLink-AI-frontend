import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[90px] w-full rounded-xl border border-[#E3EAE5] bg-white px-3.5 py-2.5 text-sm text-[#17251F] placeholder:text-[#64736B]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#C44E4E] focus-visible:ring-[#C44E4E]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#C44E4E] font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
