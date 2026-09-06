import { Skeleton } from "@cosmediate/ui";

export const FiltersLayoutLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-10">
      <div className="w-full flex items-end justify-start gap-2">
        <Skeleton className="h-14 w-3 rounded-xl" />
        <Skeleton className="h-16 w-3 rounded-xl" />
        <Skeleton className="h-20 w-3 rounded-xl" />
        <Skeleton className="h-10 w-3 rounded-xl" />
        <Skeleton className="h-8 w-3 rounded-xl" />
        <Skeleton className="h-14 w-3 rounded-xl" />
        <Skeleton className="h-16 w-3 rounded-xl" />
        <Skeleton className="h-20 w-3 rounded-xl" />
        <Skeleton className="h-10 w-3 rounded-xl" />
        <Skeleton className="h-8 w-3 rounded-xl" />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-4 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[50%] rounded-xl" />
      </div>

      <div className="w-full flex max-lg:flex-col items-center justify-between gap-2">
        <Skeleton className="h-10 w-[50%] rounded-xl" />
        <Skeleton className="h-10 w-[50%] rounded-xl" />
      </div>
    </div>
  );
};
