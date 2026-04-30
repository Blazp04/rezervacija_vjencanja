import { cn } from "@/utils/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };
  return (
    <div
      role="status"
      aria-label="Učitavanje"
      className={cn(
        "animate-spin rounded-full border-primary border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );
}
