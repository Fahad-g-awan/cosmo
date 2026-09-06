import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const DashboardPageLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="w-full flex items-center justify-between gap-2 max-sm:flex-col">
        <Skeleton className="h-15 w-50 max-sm:w-full" />
        <Skeleton className="h-15 w-50 max-sm:w-full" />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-2">
        <div className="w-full grid grid-cols-4 max-sm:grid-cols-1 max-lg:grid-cols-2 items-center justify-center gap-2">
          <Skeleton className="h-23 w-full" />
          <Skeleton className="h-23 w-full" />
          <Skeleton className="h-23 w-full" />
          <Skeleton className="h-23 w-full" />
        </div>

        <div className="w-full max-sm:hidden grid grid-cols-3 max-sm:grid-cols-1 max-lg:grid-cols-2 items-center justify-center gap-2">
          <Skeleton className="h-25 w-full" />
          <Skeleton className="h-25 w-full" />
          <Skeleton className="h-25 w-full" />
        </div>
      </div>

      <div className="w-full flex flex-col items-center justify-start gap-4">
        <Skeleton className="h-13 w-[20%] max-sm:w-[30%] rounded-xl self-start" />
        <div className="w-full flex flex-col items-center justify-start gap-4">
          <Skeleton className="h-13 w-full rounded-xl" />
          <Skeleton className="h-13 w-full rounded-xl" />
          <Skeleton className="h-13 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};
