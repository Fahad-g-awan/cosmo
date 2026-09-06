import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const TreatmentSelectionLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="w-full flex items-start justify-start gap-2">
        <Skeleton className="h-10 w-50" />
        <Skeleton className="h-10 w-50" />
      </div>

      <div className="w-full grid grid-cols-3 max-lg:grid-cols-1 items-start justify-center gap-5">
        <div className="w-full flex items-start justify-center gap-5 max-lg:hidden">
          <Skeleton className="h-70 w-full" />
        </div>

        <div className="w-full lg:col-span-2 flex flex-col items-center justify-center gap-5">
          <Skeleton className="h-70 w-full" />

          <div className="w-full flex items-start justify-center gap-5">
            <Skeleton className="h-10 w-full place-self-end" />
            <Skeleton className="h-10 w-full place-self-end" />
          </div>
        </div>
      </div>
    </div>
  );
};
