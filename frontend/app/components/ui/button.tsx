import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-parchment shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:bg-ink/85 hover:-translate-y-0.5 hover:shadow-md",
        outline:
          "border border-ink/30 bg-transparent text-ink hover:bg-ink/5 hover:border-ink/60",
        ghost:
          "bg-transparent text-ink/70 hover:bg-ink/5 hover:text-ink",
        destructive:
          "bg-red-800 text-white hover:bg-red-700",
        secondary:
          "bg-stone border border-stone-dark text-ink hover:bg-stone-dark",
        link:
          "text-ink underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// LinkButton — use this when wrapping Next.js <Link> or <a> tags
export function linkButtonVariants(variant?: ButtonProps["variant"], size?: ButtonProps["size"], extra?: string) {
  return cn(buttonVariants({ variant, size }), extra)
}

export { Button, buttonVariants }
