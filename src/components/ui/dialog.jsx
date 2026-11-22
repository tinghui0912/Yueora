"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border border-line-subtle bg-surface-canvas p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-dialog",
        className
      )}
      {...props}>
      {children}
      <DialogPrimitive.Close
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-surface-canvas transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:pointer-events-none text-ink-secondary hover:text-ink-primary">
        <X className="icon-sm" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className = '',
  children = null,
  ...props
}) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}>
    {children}
  </div>
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className = '',
  children = null,
  ...props
}) => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end", className)}
    {...props}>
    {children}
  </div>
)
DialogFooter.displayName = "DialogFooter"

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & React.RefAttributes<HTMLHeadingElement>
 * >}
 */
const DialogTitle = React.forwardRef(({ className = '', children = null, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("type-panel-title text-ink-primary font-semibold", className)}
    {...props}>
    {children}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & React.RefAttributes<HTMLParagraphElement>
 * >}
 */
const DialogDescription = React.forwardRef(({ className = '', children = null, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("type-card-metadata text-ink-secondary", className)}
    {...props}>
    {children}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}