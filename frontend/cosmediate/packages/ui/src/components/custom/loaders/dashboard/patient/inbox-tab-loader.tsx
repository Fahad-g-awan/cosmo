import { Skeleton } from "@cosmediate/ui/components/skeleton";

export const InboxTabLoader = () => {
  return (
    <div className="container w-full flex flex-col items-center justify-start gap-5 mb-5">
      <Skeleton className="w-[40%] max-sm:w-[80%] h-[40px] rounded-lg self-start" />

      <div className="w-full border bg-primary-accent/5 p-5 rounded-xl max-w-4xl grid grid-cols-3 max-lg:grid-cols-1 items-center justify-center gap-16">
        {/* Conversations */}
        <div className="w-full col-span-1 flex flex-col items-start justify-start gap-5">
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[55px] h-[45px] rounded-full" />
            <Skeleton className="w-full h-[30px] rounded-lg" />
          </div>
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[55px] h-[45px] rounded-full" />
            <Skeleton className="w-full h-[30px] rounded-lg" />
          </div>
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[55px] h-[45px] rounded-full" />
            <Skeleton className="w-full h-[30px] rounded-lg" />
          </div>
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[55px] h-[45px] rounded-full" />
            <Skeleton className="w-full h-[30px] rounded-lg" />
          </div>
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[55px] h-[45px] rounded-full" />
            <Skeleton className="w-full h-[30px] rounded-lg" />
          </div>
        </div>

        {/* Chats */}
        <div className="w-full col-span-2 max-sm:col-span-1 max-lg:hidden flex flex-col items-start justify-start place-self-end gap-5">
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[50px] h-[50px] rounded-full" />
            <Skeleton className="w-[80%] h-[30px] rounded-lg" />
          </div>
          <div className="w-full flex items-center justify-start gap-3">
            <Skeleton className="w-[50px] h-[50px] rounded-full" />
            <Skeleton className="w-[80%] h-[30px] rounded-lg" />
          </div>
          <Skeleton className="w-full h-[30px] rounded-lg" />
        </div>
      </div>
    </div>
  );
};
