import { Separator } from "@cosmediate/ui/components/separator";
import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const TreatmentResultsFormLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-6">
      <Skeleton className="h-10 w-[40%]" />
      <Separator className="w-full" />
      <div className="w-full flex items-start justify-center gap-5">
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[250px] w-full" />
      </div>

      <Separator className="w-full" />

      <div className="w-full flex flex-col items-center justify-center gap-5">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Separator className="w-full" />
        <Skeleton className="h-10 w-[50%] place-self-end" />
      </div>
    </div>
  );
};
