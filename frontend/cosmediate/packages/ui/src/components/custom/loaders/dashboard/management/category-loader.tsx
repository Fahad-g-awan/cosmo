import { Skeleton } from "@cosmediate/ui/";

export const CategoryLoader = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      <Skeleton className="w-full h-35 rounded-lg" />
      <Skeleton className="w-full h-25 rounded-lg" />
      <Skeleton className="w-full h-25 rounded-lg" />
      <Skeleton className="place-self-end h-10 w-[50%] rounded-lg" />
    </div>
  );
};
