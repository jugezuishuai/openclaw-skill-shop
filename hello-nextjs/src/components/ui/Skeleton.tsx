import { cn } from "@/lib/utils";

export default function Skeleton({
  className,
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("animate-pulse rounded-md bg-gray-200", className)}
        />
      ))}
    </>
  );
}
