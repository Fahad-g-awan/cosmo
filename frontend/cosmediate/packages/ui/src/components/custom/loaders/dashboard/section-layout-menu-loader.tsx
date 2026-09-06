import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const SectionLayoutMenuLoader = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start gap-4 p-5 bg-primary-accent/5 rounded-2xl">
      <Skeleton className="w-full h-10 rounded-md" />
      <Skeleton className="w-full h-10 rounded-md" />
      <Skeleton className="w-full h-10 rounded-md" />
      <Skeleton className="w-full h-10 rounded-md" />
    </div>
  );
};
