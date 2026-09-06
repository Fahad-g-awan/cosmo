import { Separator, Skeleton } from "@cosmediate/ui";

export const LeadDetailsLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 mb-5">
      <Skeleton className="w-full h-30 rounded-md" />

      <Separator className="my-4" />

      <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-5">
        <Skeleton className="w-full h-20 rounded-md" />
        <Skeleton className="w-full h-20 rounded-md" />
        <Skeleton className="w-full h-20 rounded-md" />
        <Skeleton className="w-full h-20 rounded-md" />
        <Skeleton className="w-full h-20 rounded-md" />
        <Skeleton className="w-full h-20 rounded-md" />
      </div>
    </div>
  );
};
