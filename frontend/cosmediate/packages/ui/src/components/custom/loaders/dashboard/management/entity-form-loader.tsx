import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const EntityFormLoader = () => {
  return (
    <div className="w-full flex max-sm:flex-col items-start justify-start gap-6">
      <div className="w-[30%] max-lg:w-full flex flex-col items-start justify-start gap-5">
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
        <Skeleton className="h-10 w-[50%] place-self-end" />
      </div>
    </div>
  );
};
