import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const ReviewCardLoader = () => {
  return (
    <div className="w-full flex items-start justify-start max-lg:flex-col gap-3">
      <div className="w-[20%] max-lg:w-full flex items-center justify-start gap-2">
        <Skeleton className="h-15 w-15 rounded-full" />
        <Skeleton className="h-8 w-[60%] max-lg:w-20" />
      </div>

      <div className="w-[80%] max-lg:w-full flex flex-col items-start justify-start gap-2">
        <div className="w-full space-y-2">
          <Skeleton className="h-8 w-[80%]" />
          <Skeleton className="h-8 w-[50%]" />
        </div>

        <div className="w-full flex items-center justify-start gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </div>
  );
};
