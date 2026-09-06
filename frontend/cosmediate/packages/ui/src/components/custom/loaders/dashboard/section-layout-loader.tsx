import { Skeleton, SectionLayoutMenuLoader } from "@cosmediate/ui";

export const SectionLayoutLoader = () => {
  return (
    <div className="container w-full flex flex-col items-center justify-start gap-5">
      <Skeleton className="w-full h-15 rounded-lg" />
      <div className="w-full grid grid-cols-4 max-sm:grid-cols-1 items-start justify-center gap-5">
        <div className="w-full col-span-1 max-sm:hidden">
          {/* <SectionLayoutMenuLoader /> */}
          <Skeleton className="w-full h-50 rounded-lg" />
        </div>
        <div className="w-full col-span-3 max-sm:col-span-1">
          <div className="w-full flex flex-col items-center justify-start gap-2">
            <div className="w-full flex items-center justify-end gap-5">
              <Skeleton className="w-[20%] max-sm:w-[30%] h-10 rounded-lg" />
              <Skeleton className="w-[20%] max-sm:w-[30%] h-10 rounded-lg" />
            </div>
            <Skeleton className="w-full h-10 rounded-lg" />
            <Skeleton className="w-full h-50 rounded-lg" />
            {/* <Skeleton className="w-full h-25 rounded-lg" /> */}
            <Skeleton className="w-[50%] h-10 rounded-lg self-end" />
          </div>
        </div>
      </div>
    </div>
  );
};
