import { Skeleton } from "@cosmediate/ui";

export const SidebarLoader = () => {
  return (
    <div className="w-[70px] max-lg:w-full flex flex-col items-center justify-start gap-4 max-lg:gap-2 max-lg:flex-row max-lg:items-center max-lg:justify-center max-lg:mt-2">
      <Skeleton className="h-[50px] w-[50px] rounded-xl mt-5 max-lg:mt-0" />
      <Skeleton className="h-[50px] w-[50px] rounded-xl" />
      <Skeleton className="h-[50px] w-[50px] rounded-xl" />
      <Skeleton className="h-[50px] w-[50px] rounded-xl max-sm:hidden" />
      <Skeleton className="h-[50px] w-[50px] rounded-xl max-lg:hidden" />
      <Skeleton className="h-[50px] w-[50px] rounded-xl max-lg:hidden" />
    </div>
  );
};
