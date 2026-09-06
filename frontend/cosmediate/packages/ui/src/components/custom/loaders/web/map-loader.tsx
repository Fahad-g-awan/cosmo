import { SmallLoader, Skeleton } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

export const MapLoader = ({
  className,
  showLoader = true,
}: {
  className?: string;
  showLoader?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative w-full rounded-xl flex items-center justify-center",
        className
      )}
    >
      <Skeleton className="w-full h-[400px] rounded-xl" />
      {showLoader && (
        <SmallLoader
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          showText={false}
        />
      )}
    </div>
  );
};
