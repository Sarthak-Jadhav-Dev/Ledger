import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-20 w-full rounded-sm border border-stone-dark bg-parchment/60 px-4 py-3 text-sm text-ink placeholder:text-ink/35 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(26,20,16,0.02)] focus-visible:outline-none focus-visible:border-ink/50 focus-visible:ring-4 focus-visible:ring-ink/10 focus-visible:bg-parchment disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
