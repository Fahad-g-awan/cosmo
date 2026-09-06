import { ScrollArea, Skeleton } from "@cosmediate/ui";

export const MoreArticlesLoader = () => {
  const array = new Array(3).fill(0);
  return (
    <div className="w-full grid grid-cols-1 max-lg:grid-cols-3 gap-5 max-sm:gap-3">
      <Skeleton className="h-10 w-[50%] rounded-xl" />

      {array.map((_, index) => (
        <div key={index} className="flex w-full flex-col gap-2 ">
          <Skeleton className="h-[150px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[50%]" />
          </div>
        </div>
      ))}
    </div>
  );
};
