import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const ProfileHeaderLoader = () => {
  return (
    <div className="w-full flex items-center justify-start gap-3 max-lg:flex-col max-lg:justify-center">
      <Skeleton className="w-[110px] h-[100px] rounded-full" />

      <div className="w-full flex flex-col items-start justify-start gap-3 max-lg:justify-center max-lg:items-center">
        <Skeleton className="w-[200px] h-5 rounded-md" />
        <Skeleton className="w-[100px] h-5 rounded-md" />
      </div>
    </div>
  );
};
