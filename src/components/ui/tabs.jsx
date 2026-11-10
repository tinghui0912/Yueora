import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & React.RefAttributes<React.ElementRef<typeof TabsPrimitive.List>>>}
 */
const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-control bg-neutral-muted p-1 text-ink-secondary",
      className
    )}
    {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & React.RefAttributes<React.ElementRef<typeof TabsPrimitive.Trigger>>>}
 */
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 type-body-small font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-ink-secondary hover:text-ink-primary hover:bg-neutral-hover data-[state=active]:bg-surface-panel data-[state=active]:text-ink-primary",
      className
    )}
    {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & React.RefAttributes<React.ElementRef<typeof TabsPrimitive.Content>>>}
 */
const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
      className
    )}
    {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
