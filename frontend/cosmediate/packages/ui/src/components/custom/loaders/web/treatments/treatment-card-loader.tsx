import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const TreatmentCardLoader = () => {
  return (
    <div className="relative w-full flex flex-col items-start justify-start gap-3">
      <Skeleton className="h-[220px] w-full rounded-xl" />
      <Skeleton className="absolute top-3 right-3 bg-100 h-8 w-25 rounded-md z-10" />
      <Skeleton className="absolute top-[60%] right-3 bg-100 h-8 w-25 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-[240px]" />
        <Skeleton className="h-5 w-[280px]" />
      </div>
      <Skeleton className="h-10 w-[30%]" />
    </div>
  );
};
