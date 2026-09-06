import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const AppointmentTabLoader = () => {
  return (
    <div className="w-full container flex flex-col items-center justify-start gap-5 mb-5">
      <Skeleton className="w-[40%] max-sm:w-[80%] h-[40px] rounded-lg self-start" />

      <div className="w-full flex flex-col items-center justify-start gap-5">
        <div className="w-full flex items-center justify-end gap-5">
          <Skeleton className="w-20 h-10 rounded-lg" />
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-[50%] h-10 rounded-lg self-end" />
      </div>
    </div>
  );
};
