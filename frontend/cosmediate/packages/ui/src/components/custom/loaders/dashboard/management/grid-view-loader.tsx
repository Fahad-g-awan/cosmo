import { Skeleton } from "@cosmediate/ui";

export const GridViewLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <Skeleton className="h-10 w-[20%] max-sm:w-[30%] rounded-xl self-end" />
      <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-center justify-start gap-4">
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
        <Skeleton className="h-[350px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-[30%] max-sm:w-[50%] rounded-xl self-end" />
    </div>
  );
};
