import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const ClinicFormLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <div className="w-full flex items-start justify-start gap-2">
        <Skeleton className="h-10 w-50" />
        <Skeleton className="h-10 w-50" />
      </div>

      <div className="w-full grid grid-cols-2 items-center justify-center gap-5">
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
        <Skeleton className="h-15 w-full" />
      </div>

      <Skeleton className="h-10 w-30 place-self-end" />
    </div>
  );
};
