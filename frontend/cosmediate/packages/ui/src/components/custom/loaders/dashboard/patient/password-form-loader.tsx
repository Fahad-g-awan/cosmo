import { Separator, Skeleton } from "@cosmediate/ui";

export const PasswordFormLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 mb-5">
      <div className="w-full grid grid-cols-3 items-center justify-start gap-5">
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
      </div>

      <Separator className="my-4" />

      <div className="w-full grid grid-cols-1 items-start justify-start gap-5 border p-5 rounded-xl">
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
      </div>

      <Separator className="my-4" />

      <Skeleton className="w-[150px] h-10 rounded-md self-end" />
    </div>
  );
};
