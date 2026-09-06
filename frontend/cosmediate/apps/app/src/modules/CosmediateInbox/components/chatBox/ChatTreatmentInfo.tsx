import React from "react";

import { Separator } from "@cosmediate/ui/components/separator";
import { Treatment } from "../../types";

const ChatTreatmentInfo = ({ treatment }: { treatment: Treatment }) => {
  return (
    <div className="w-full p-6 max-sm:p-0 border border-stroke rounded-md flex items-center justify-between max-sm:flex-col">
      <div className="w-full max-sm:px-4 max-sm:py-2 flex flex-col items-start justify-center gap-2 max-sm:flex-row max-sm:items-center max-sm:justify-between">
        <div className="text-400 text-[9px] font-medium leading-[9px] tracking-[0.18px]">
          Treatment
        </div>
        <div className="text-700 text-[12px] font-bold leading-[16.8px] text-wrap">
          {treatment.name}
        </div>
      </div>
      <Separator className="w-full sm:hidden" />
      <div className="w-full max-sm:px-4 max-sm:py-2 flex flex-col items-start justify-center gap-2 max-sm:flex-row max-sm:items-center max-sm:justify-between">
        <div className="text-400 text-[9px] font-medium leading-[9px] tracking-[0.18px]">
          Clinic
        </div>
        <div className="text-700 text-[12px] leading-[16.8px] text-wrap">
          {treatment.clinic}
        </div>
      </div>
      <Separator className="w-full sm:hidden" />
      <div className="w-full max-sm:px-4 max-sm:py-2 flex flex-col items-start justify-center gap-2 max-sm:flex-row max-sm:items-center max-sm:justify-between">
        <div className="text-400 text-[9px] font-medium leading-[9px] tracking-[0.18px]">
          Telephone
        </div>
        <div className="text-700 text-[12px] leading-[16.8px]">
          {treatment.phone}
        </div>
      </div>
      <Separator className="w-full sm:hidden" />
      <div className="w-full max-sm:px-4 max-sm:py-2 flex flex-col items-start justify-center gap-2 max-sm:flex-row max-sm:items-center max-sm:justify-between">
        <div className="text-400 text-[9px] font-medium leading-[9px] tracking-[0.18px]">
          Date
        </div>
        <div className="text-700 text-[12px] leading-[16.8px]">
          {treatment.date}
        </div>
      </div>
    </div>
  );
};

export default ChatTreatmentInfo;
