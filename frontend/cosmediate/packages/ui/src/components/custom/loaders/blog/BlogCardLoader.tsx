import { Skeleton } from "@cosmediate/ui";

export const BlogCardLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={`w-full flex flex-col items-start justify-start gap-3 ${className}`}
    >
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-4 w-16 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-[220px]" />
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-5 w-[180px]" />
      </div>
    </div>
  );
};
