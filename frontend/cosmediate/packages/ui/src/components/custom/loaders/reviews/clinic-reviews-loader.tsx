import { ReviewCardLoader, Separator, Skeleton } from "@cosmediate/ui";

export const ClinicReviewsLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-5">
      <Skeleton className="h-10 w-45 rounded-lg" />
      <div className="w-full flex flex-col items-start justify-start gap-5">
        <ReviewCardLoader />
        <Separator className="w-full" />
        <ReviewCardLoader />
        <Separator className="w-full" />
        <ReviewCardLoader />
      </div>
    </div>
  );
};
