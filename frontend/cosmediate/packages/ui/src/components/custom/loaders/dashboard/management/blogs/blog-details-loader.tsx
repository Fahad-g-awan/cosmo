import { Skeleton } from "@cosmediate/ui";

export const BlogsDetailsLoader = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="w-full h-30" />
      </div>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-80 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
};
