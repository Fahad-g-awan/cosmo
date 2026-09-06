import { ReviewCardLoader, Separator } from "@cosmediate/ui";

export const ReviewsLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-5">
      <ReviewCardLoader />
      <Separator className="w-full" />
      <ReviewCardLoader />
      <Separator className="w-full" />
      <ReviewCardLoader />
    </div>
  );
};
