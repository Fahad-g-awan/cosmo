import { RespliesCardLoader, Separator } from "@cosmediate/ui";

export const ReviewRepliesLoader = () => {
  return (
    <div className="w-full flex flex-col items-start justify-start gap-8">
      <RespliesCardLoader />
      <Separator className="w-full" />
      <RespliesCardLoader />
      <Separator className="w-full" />
      <RespliesCardLoader />
    </div>
  );
};
