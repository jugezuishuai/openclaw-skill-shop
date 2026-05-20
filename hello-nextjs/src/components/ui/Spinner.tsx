import { cn } from "@/lib/utils";

export default function Spinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-[3px] border-gray-200 border-t-blue-600 shadow-sm",
        sizeClasses[size],
        className
      )}
    />
  );
}
