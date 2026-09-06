import { Skeleton } from "@cosmediate/ui";

export const GridItemsLoader = () => {
  return (
    <div className="w-full grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-center justify-center gap-5">
      <GridItem />
      <GridItem />
      <GridItem />
      <GridItem />
      <GridItem />
      <GridItem />
    </div>
  );
};

const GridItem = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-3">
      <Skeleton className="h-[250px] w-full rounded-xl" />
      <Skeleton className="h-5 w-[70%] rounded-xl" />
      <Skeleton className="h-4 w-[40%] rounded-xl" />
      <Skeleton className="h-8 w-[100px] rounded-xl" />
    </div>
  );
};
