import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B4D] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#176B4D] text-white shadow-sm hover:bg-[#10553C] active:bg-[#0c422f]',
        secondary:
          'bg-[#EAF5EF] text-[#176B4D] hover:bg-[#d8ece0] font-semibold',
        outline:
          'border border-[#E3EAE5] bg-white text-[#17251F] hover:bg-[#F8FAF8] hover:border-[#CBD5E1]',
        ghost:
          'text-[#17251F] hover:bg-[#EAF5EF]/60 hover:text-[#176B4D]',
        accent:
          'bg-[#E8A84B] text-[#17251F] font-semibold hover:bg-[#d99738] shadow-sm',
        danger:
          'bg-[#C44E4E] text-white hover:bg-[#b04040] shadow-sm',
        dangerOutline:
          'border border-[#C44E4E]/30 text-[#C44E4E] hover:bg-[#FDF2F2]',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base font-semibold rounded-2xl',
        icon: 'h-10 w-10 p-0',
        iconSm: 'h-8 w-8 p-0 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
