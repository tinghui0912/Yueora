import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("animate-pulse rounded-control bg-neutral-muted", className)}
      {...props} />)
  );
}

export { Skeleton }
