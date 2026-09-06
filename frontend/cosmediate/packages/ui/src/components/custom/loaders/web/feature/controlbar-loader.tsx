import { Skeleton } from "@cosmediate/ui";

export const ControlbarLoader = () => {
  return (
    <div className="w-full flex items-center justify-between gap-3">
      <div className="w-[200px] flex items-center justify-center gap-2 max-sm:w-[100px]">
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-xl" />
      </div>

      <Skeleton className="h-8 w-[100px] rounded-xl" />
    </div>
  );
};
