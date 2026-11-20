import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { hasError?: boolean } & React.RefAttributes<HTMLButtonElement>
 * >}
 */
const SelectTrigger = React.forwardRef(({ className = '', children = null, hasError = false, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-control-md min-h-control-md w-full items-center justify-between whitespace-nowrap rounded-control border border-line-subtle bg-transparent px-3 py-1.5 type-body-small text-ink-primary shadow-control ring-offset-background transition-colors placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      hasError && "border-danger focus:ring-danger",
      className
    )}
    {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="icon-sm text-ink-secondary opacity-70" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectScrollUpButton = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="icon-sm text-ink-secondary" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectScrollDownButton = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="icon-sm text-ink-secondary" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectContent = React.forwardRef(({ className = '', children = null, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-menu border border-line-subtle/50 bg-surface-panel text-ink-primary shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn("p-1", position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectLabel = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 type-menu-label font-semibold text-ink-primary", className)}
    {...props} />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectItem = React.forwardRef(({ className = '', children = null, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 type-body-small text-ink-primary outline-none transition-colors focus:bg-neutral-hover focus:text-ink-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="icon-xs text-brand" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

/**
 * @type {React.ForwardRefExoticComponent<
 *   React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & React.RefAttributes<HTMLDivElement>
 * >}
 */
const SelectSeparator = React.forwardRef(({ className = '', ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-line-subtle/50", className)}
    {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

/**
 * NativeSelect — standard HTML select styled to perfectly match Yueora Input and SelectTrigger.
 * @type {React.ForwardRefExoticComponent<
 *   React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean } & React.RefAttributes<HTMLSelectElement>
 * >}
 */
const NativeSelect = React.forwardRef(({ className = '', hasError = false, children = null, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-control-md min-h-control-md w-full appearance-none rounded-control border border-line-subtle bg-transparent px-3 py-1.5 pr-9 type-body-small text-ink-primary shadow-control transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        hasError && "border-danger focus:ring-danger",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 icon-sm text-ink-secondary opacity-70" />
  </div>
))
NativeSelect.displayName = "NativeSelect"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  NativeSelect,
}
