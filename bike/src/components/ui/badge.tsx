import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&_svg]:size-3 [&_svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'border-amber-400/30 bg-amber-400/12 text-amber-300',
        teal: 'border-teal-400/30 bg-teal-400/12 text-teal-300',
        success: 'border-emerald-400/30 bg-emerald-400/12 text-emerald-300',
        destructive: 'border-red-400/30 bg-red-400/12 text-red-300',
        muted: 'border-white/10 bg-white/6 text-muted-foreground',
        outline: 'border-white/15 bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'div'
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
