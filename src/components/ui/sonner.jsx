"use client";
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={/** @type {"system" | "dark" | "light"} */ (theme)}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-surface-panel group-[.toaster]:text-ink-primary group-[.toaster]:border-line-subtle group-[.toaster]:shadow-overlay group-[.toaster]:rounded-overlay",
          description: "group-[.toast]:text-ink-secondary",
          actionButton:
            "group-[.toast]:bg-brand group-[.toast]:text-brand-foreground group-[.toast]:shadow-raised",
          cancelButton:
            "group-[.toast]:bg-neutral-muted group-[.toast]:text-ink-secondary",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
