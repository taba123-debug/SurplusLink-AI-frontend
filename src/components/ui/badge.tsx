import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#176B4D] text-white',
        secondary: 'bg-[#EAF5EF] text-[#176B4D]',
        accent: 'bg-[#FEF8EC] text-[#B27318] border border-[#E8A84B]/30',
        outline: 'border border-[#E3EAE5] text-[#64736B] bg-white',
        danger: 'bg-[#FDF2F2] text-[#C44E4E] border border-[#C44E4E]/20',
        neutral: 'bg-neutral-100 text-neutral-700',
        verified: 'bg-[#EAF5EF] text-[#176B4D] border border-[#176B4D]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
