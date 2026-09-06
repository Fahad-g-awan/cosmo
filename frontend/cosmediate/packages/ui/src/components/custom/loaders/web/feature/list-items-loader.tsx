import { Skeleton } from "@cosmediate/ui";

export const ListItemsLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-4">
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
    </div>
  );
};

const ListItem = () => {
  return (
    <div className="w-full flex items-start justify-start gap-3">
      <Skeleton className="h-[80px] w-[100px] rounded-xl" />
      <div className="w-full flex flex-col items-start justify-start gap-3">
        <Skeleton className="h-5 w-[70%] rounded-xl" />
        <Skeleton className="h-4 w-[40%] rounded-xl" />
        {/* <Skeleton className="h-8 w-[100px] rounded-xl" /> */}
      </div>
    </div>
  );
};
