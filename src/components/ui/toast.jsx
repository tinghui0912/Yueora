import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Viewport>>>}
 */
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-overlay border p-6 pr-8 shadow-overlay transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-line-subtle bg-surface-panel text-ink-primary",
        destructive:
          "destructive group border-danger/30 bg-surface-panel text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & import("class-variance-authority").VariantProps<typeof toastVariants> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Root>>>}
 */
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Action>>>}
 */
const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-control border border-line-subtle bg-transparent px-3 type-body-small font-medium transition-colors hover:bg-neutral-hover focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-ink-primary group-[.destructive]:border-danger/30 group-[.destructive]:hover:bg-danger/10 group-[.destructive]:text-danger group-[.destructive]:focus:ring-danger",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Close>>>}
 */
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-control p-1 text-ink-secondary opacity-70 transition-opacity hover:opacity-100 hover:text-ink-primary focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand group-[.destructive]:text-danger/70 group-[.destructive]:hover:text-danger",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Title>>>}
 */
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("type-body-small font-semibold text-ink-primary", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & React.RefAttributes<React.ElementRef<typeof ToastPrimitives.Description>>>}
 */
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("type-caption text-ink-secondary", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
