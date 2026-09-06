"use client";

export const ReplyUser = ({ name, date }: { name: string; date: string }) => {
  return (
    <div className="w-full flex items-center justify-between gap-2 max-sm:flex-col max-sm:justify-start max-sm:items-start">
      <div className="text-sm text-700 font-bold leading-[17px] text-wrap">
        {name}
      </div>
      <div className="text-[11px] text-400 font-medium leading-4 tracking-[0.22px]">
        {date}
      </div>
    </div>
  );
};
