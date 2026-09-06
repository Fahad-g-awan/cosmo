import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const DetailPageLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      <Skeleton className="w-full h-35" />
      <div className="w-full flex items-start justify-start gap-3 max-lg:flex-col">
        <div className="w-[30%] max-lg:w-full flex flex-col items-center justify-start gap-5">
          <Skeleton className="h-50 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="w-[70%] max-lg:w-full flex flex-col items-center justify-center gap-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />

          <div className="w-full flex items-center justify-center gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
};
