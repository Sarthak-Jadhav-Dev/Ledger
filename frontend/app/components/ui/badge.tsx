import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-ink/20 bg-ink text-parchment",
        outline:
          "border-ink/30 text-ink bg-transparent",
        secondary:
          "border-stone-dark bg-stone text-ink/70",
        success:
          "border-emerald-700/30 bg-emerald-700/10 text-emerald-800",
        destructive:
          "border-red-700/30 bg-red-700/10 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
