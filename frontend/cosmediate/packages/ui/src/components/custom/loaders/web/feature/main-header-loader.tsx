import { Skeleton } from "@cosmediate/ui";

export const MainHeaderLoader = () => {
  return (
    <div className="w-full bg-accent/40 rounded-xl p-4 grid grid-cols-3 max-sm:grid-cols-1 items-center justify-center gap-5">
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
};
