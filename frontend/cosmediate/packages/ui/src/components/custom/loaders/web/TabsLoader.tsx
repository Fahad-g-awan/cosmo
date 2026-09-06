import { SiteContainer, Skeleton } from "@cosmediate/ui";

export const TabsLoader = () => {
  return (
    <SiteContainer>
      <div className="w-full flex items-start justify-center max-lg:flex-col gap-5 my-10">
        <div className="w-[70%] max-lg:w-full flex flex-col items-center justify-start gap-4">
          <div className="w-full flex max-lg:flex-col items-start justify-start gap-2">
            <Skeleton className="h-[200px] w-[250px] max-lg:w-full rounded-xl" />

            <div className="w-full flex flex-col items-start justify-start gap-2">
              <Skeleton className="h-[30px] w-[40%] max-lg:w-full rounded-xl" />
              <Skeleton className="h-[30px] w-[40%] max-lg:w-full rounded-xl" />
              <Skeleton className="h-[20px] w-[70%] max-lg:w-full rounded-xl" />
              <Skeleton className="h-[20px] w-[70%] max-lg:w-full rounded-xl" />
              <Skeleton className="h-[20px] w-[70%] max-lg:w-full rounded-xl" />
            </div>
          </div>

          <div className="w-full flex max-slg:flex-col items-start justify-start gap-2 mt-5">
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
            <Skeleton className="h-[100px] w-[100px] rounded-full" />
          </div>
        </div>

        <div className="w-[30%] max-lg:hidden flex flex-col items-start justify-start gap-3">
          <Skeleton className="h-[300px] w-full rounded-xl" />

          <div className="w-full flex max-lg:flex-col items-center justify-center gap-2">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </SiteContainer>
  );
};
