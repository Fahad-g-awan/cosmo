import { Skeleton } from "@cosmediate/ui";

export const BlogsFormLoader = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="xl:w-80 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
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
