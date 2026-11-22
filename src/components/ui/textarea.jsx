import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<"textarea"> & React.RefAttributes<HTMLTextAreaElement>>}
 */
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    (<textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-control border border-line-subtle bg-transparent px-3.5 py-2.5 type-body-small text-ink-primary shadow-control placeholder:text-ink-tertiary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
