import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive> & React.RefAttributes<HTMLDivElement>>}
 */
const Command = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-container bg-surface-panel text-ink-primary",
      className
    )}
    {...props} />
))
Command.displayName = CommandPrimitive.displayName

const CommandDialog = ({
  children,
  ...props
}) => {
  return (
    (<Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-ink-secondary [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>)
  );
}

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & React.RefAttributes<HTMLInputElement>>}
 */
const CommandInput = React.forwardRef(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-line-subtle px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 text-ink-secondary opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-control bg-transparent py-3 type-body-small outline-none placeholder:text-ink-tertiary text-ink-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props} />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & React.RefAttributes<HTMLDivElement>>}
 */
const CommandList = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props} />
))

CommandList.displayName = CommandPrimitive.List.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty> & React.RefAttributes<HTMLDivElement>>}
 */
const CommandEmpty = React.forwardRef((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center type-caption text-ink-tertiary" {...props} />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & React.RefAttributes<HTMLDivElement>>}
 */
const CommandGroup = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-ink-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:type-caption [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-ink-secondary",
      className
    )}
    {...props} />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator> & React.RefAttributes<HTMLDivElement>>}
 */
const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-line-subtle", className)} {...props} />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

/**
 * @type {React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & React.RefAttributes<HTMLDivElement>>}
 */
const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default gap-2 select-none items-center rounded-control px-2 py-1.5 type-body-small outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-neutral-hover data-[selected=true]:text-ink-primary data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props} />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}) => {
  return (
    (<span
      className={cn("ml-auto type-caption tracking-widest text-ink-tertiary", className)}
      {...props} />)
  );
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
