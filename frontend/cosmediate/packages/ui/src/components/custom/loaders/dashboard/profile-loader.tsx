import { Separator, Skeleton } from "@cosmediate/ui";

export const ProfileLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 mb-5">
      <div className="w-full flex items-center justify-start gap-5">
        <Skeleton className="w-28 h-28 rounded-full" />
        <Skeleton className="w-[150px] h-10 rounded-md" />
      </div>

      <Separator className="my-4" />

      <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 items-start justify-start gap-5">
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
      </div>
      <Skeleton className="w-full h-30 rounded-md" />

      <Separator className="my-4" />

      <Skeleton className="w-[150px] h-10 rounded-md self-end" />
    </div>
  );
};
