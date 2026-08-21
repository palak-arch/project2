import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-amber-400 to-orange-500 text-[#1c1102] shadow-[0_8px_24px_-8px_rgba(245,165,36,0.6)] hover:brightness-110 hover:shadow-[0_10px_30px_-8px_rgba(245,165,36,0.75)]',
        teal: 'bg-gradient-to-b from-teal-400 to-cyan-500 text-[#05211c] shadow-[0_8px_24px_-8px_rgba(45,212,191,0.5)] hover:brightness-110',
        secondary:
          'bg-white/8 text-foreground border border-white/10 hover:bg-white/12 hover:border-white/20',
        outline:
          'border border-amber-400/40 text-amber-300 bg-amber-400/5 hover:bg-amber-400/12 hover:border-amber-400/60',
        ghost: 'hover:bg-white/8 hover:text-foreground text-muted-foreground',
        destructive: 'bg-red-500/90 text-white shadow-[0_8px_24px_-8px_rgba(239,68,68,0.5)] hover:bg-red-500',
        link: 'text-amber-300 underline-offset-4 hover:underline',
        success: 'bg-gradient-to-b from-emerald-400 to-green-500 text-[#04211a] hover:brightness-110',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-8 rounded-lg px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-12 rounded-xl px-7 text-base has-[>svg]:px-5',
        icon: 'size-10',
        'icon-sm': 'size-8 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
