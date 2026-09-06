import { cn } from "@cosmediate/ui/lib/utils";

import type { FeatureDetailsType } from "./types";

export const FeatureDetails = ({
  className,
  feature,
}: { feature: Omit<FeatureDetailsType, "id" | "image"> } & {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full bg-ghost-blue flex flex-col items-start justify-center gap-4 max-lg:items-center rounded-2xl",
        "px-14 py-16 max-sm:px-4 max-sm:py-4",
        className
      )}
    >
      {feature.Icon && (
        <div className="flex items-center justify-center w-[80px] min-h-[80px] rounded-full border-3 border-primary-accent">
          <feature.Icon className="text-primary-accent" size={24} />
        </div>
      )}

      <h1 className="text-700 text-[32px] leading-[38px] font-bold max-sm:text-2xl max-sm:leading-8 max-lg:text-center">
        {feature.title}
      </h1>
      {feature.description && (
        <p className="text-700 text-[16px] font-normal">
          {feature.description}
        </p>
      )}

      <div
        className={cn(
          "w-full flex flex-col items-start justify-center gap-2",
          "text-start"
        )}
      >
        {feature.keypoints?.map((desc: string, index: number) => (
          <div key={index} className="flex items-start justify-center gap-2">
            <span className="text-sm leading-[21px] text-primary-accent">
              •
            </span>
            <p className="text-sm leading-[21px] text-900">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
