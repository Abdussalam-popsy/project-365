import { cn } from "@/lib/utils";

const variants = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-50 text-success border border-emerald-200",
  warning: "bg-amber-50 text-warning border border-amber-200",
  danger: "bg-red-50 text-danger border border-red-200",
  outline: "border border-border text-foreground",
  primary: "bg-accent text-accent-foreground",
} as const;

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
