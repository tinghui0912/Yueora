import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * @typedef {React.InputHTMLAttributes<HTMLInputElement> & {
 *   hasError?: boolean;
 * }} InputProps
 */

/** @type {React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>} */
const Input = React.forwardRef(({ className = '', type, hasError = false, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-control-md min-h-control-md w-full rounded-control border border-line-subtle bg-transparent px-3 py-1.5 type-body-small text-ink-primary shadow-control transition-colors file:border-0 file:bg-transparent file:type-body-small file:font-medium placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50",
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
