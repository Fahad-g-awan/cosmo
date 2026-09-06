import { Skeleton } from "@cosmediate/ui";

export const TableViewLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <Skeleton className="h-10 w-[20%] max-sm:w-[30%] rounded-xl self-end" />
      <div className="w-full flex flex-col items-center justify-start gap-4">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-[30%] max-sm:w-[50%] rounded-xl self-end" />
    </div>
  );
};
