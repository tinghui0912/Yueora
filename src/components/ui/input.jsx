import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, hasError = false, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-control-lg min-h-control-lg w-full rounded-control border border-surface-paper-edge bg-surface-panel px-3.5 py-2 type-body-small text-ink-primary shadow-xs transition-colors file:border-0 file:bg-transparent file:type-body-small file:font-medium placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border-danger focus-visible:border-danger focus-visible:ring-danger/20",
        className
      )}
      ref={ref}
      {...props}
    />
  );
})
Input.displayName = "Input"

export { Input }
