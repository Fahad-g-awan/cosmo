import { Skeleton } from "@cosmediate/ui";

export const RespliesCardLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <div className="w-full flex items-center justify-start gap-2">
        <Skeleton className="h-15 w-15 rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-2">
        <div className="w-full space-y-2">
          <Skeleton className="h-5 w-[80%]" />
          <Skeleton className="h-5 w-[50%]" />
        </div>

        <div className="w-full flex items-center justify-start gap-2">
          <Skeleton className="h-6 w-15" />
          <Skeleton className="h-6 w-15" />
        </div>
      </div>
    </div>
  );
};
