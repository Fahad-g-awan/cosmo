import React from "react";

import type { WorkingHours, WorkingHoursItem } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { Separator } from "@cosmediate/ui";

const WorkingHoursView = ({ workingHours }: { workingHours: WorkingHours }) => {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-4 items-start justify-start"
      )}
    >
      <div className="font-bold text-700 text-sm leading-5">Working hours</div>

      <div className="w-full flex flex-col items-center justify-start gap-4">
        {(workingHours || []).map((item: WorkingHoursItem, index: number) => (
          <div
            key={index}
            className="w-full flex flex-col items-center justify-start gap-4"
          >
            <WorkingHoursItem item={item} />

            {index !== workingHours.length - 1 && (
              <Separator className="w-full bg-200/80" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkingHoursItem = ({ item }: { item: WorkingHoursItem }) => {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="w-[70%] max-lg:w-[40%] capitalize text-xs text-800 font-medium leading-4">
        {item.weekDay}
      </div>

      {item.available && (
        <div className="w-[30%] flex items-center justify-end gap-1 text-xs text-300 leading-4">
          <div>{item.startTime}</div>
          <Separator className="w-2 bg-200/80" />
          <div>{item.endTime}</div>
        </div>
      )}

      {!item.available && (
        <div className="w-[30%] max-sm:w-[40%] flex items-center justify-end text-xs text-300 font-medium leading-4">
          Not Available
        </div>
      )}
    </div>
  );
};

export default WorkingHoursView;
