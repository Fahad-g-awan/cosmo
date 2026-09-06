import { Skeleton } from "@cosmediate/ui";

export const ClinicCardLoaderSimple = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-3 h-[250px]">
      <Skeleton className="h-[80px] w-[80px] rounded-xl" />

      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>

      <div className="flex items-center justify-start gap-2">
        <Skeleton className="h-4 w-4 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </div>
    </div>
  );
};
