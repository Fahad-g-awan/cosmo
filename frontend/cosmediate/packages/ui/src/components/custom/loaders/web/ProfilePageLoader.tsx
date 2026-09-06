import { SiteContainer } from "@cosmediate/ui";
import { Skeleton } from "@cosmediate/ui";

export const ProfilePageLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start">
      <SiteContainer>
        <div className="w-full flex flex-col items-center justify-start gap-4 my-5">
          <div className="w-full rounded-xl p-4 bg-accent/40 flex flex-col items-start justify-start gap-4">
            <div className="w-full grid grid-cols-3 max-sm:grid-cols-1 items-center justify-center gap-5">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="w-full flex items-center justify-start gap-2 max-sm:flex-col">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="w-full flex flex-col items-start justify-center gap-2 max-sm:flex-col">
                <Skeleton className="h-5 w-[50%] max-sm:w-full rounded-xl" />
                <Skeleton className="h-5 w-[30%] rounded-xl" />
              </div>
            </div>

            <div className="w-full grid grid-cols-6 max-lg:grid-cols-3 items-start justify-start gap-4">
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
              <Skeleton className="h-10 w-full rounded" />
            </div>
          </div>

          <div className="w-full flex items-start justify-center max-lg:flex-col gap-5 mt-5">
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
        </div>
      </SiteContainer>
    </div>
  );
};
