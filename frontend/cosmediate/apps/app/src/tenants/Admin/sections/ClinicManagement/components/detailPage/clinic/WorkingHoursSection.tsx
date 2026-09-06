import React from "react";

import { WorkingHoursItem as WorkingHoursItemType } from "@cosmediate/type-utils/shared";
import { InfoMessage, Separator } from "@cosmediate/ui";

import { Calendar } from "lucide-react";

export const WorkingHoursSection = ({
  workingHours,
}: {
  workingHours: WorkingHoursItemType[];
}) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Calendar className="h-5 w-5" />
        Working Hours
      </div>

      {(workingHours || []).length === 0 && (
        <InfoMessage
          title="Working hours data not found for this clinic"
          message="If you think this is a misstake, please try again or contact support"
          size="sm"
        />
      )}

      {workingHours?.length && (
        <div className="w-full flex flex-col items-center justify-start gap-4">
          {(workingHours || []).map(
            (item: WorkingHoursItemType, index: number) => (
              <div
                key={index}
                className="w-full flex flex-col items-center justify-start gap-4"
              >
                <WorkingHoursItem item={item} />

                {index !== (workingHours || []).length - 1 && (
                  <Separator className="w-full bg-100" />
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

const WorkingHoursItem = ({ item }: { item: WorkingHoursItemType }) => {
  return (
    <div className="w-full grid grid-cols-2 items-center justify-between">
      <div className="w-full capitalize text-xs text-800 leading-4">
        {item.weekDay}
      </div>

      <div className="w-full flex items-center justify-end">
        {item.available && (
          <div className="w-full flex items-center justify-end gap-1 text-xs text-500 leading-4">
            <div>{item.startTime}</div>
            <Separator className="w-2 bg-200/80" />
            <div>{item.endTime}</div>
          </div>
        )}

        {!item.available && (
          <div className="w-full flex items-center justify-end text-xs text-300 font-medium leading-4">
            Not Available
          </div>
        )}
      </div>
    </div>
  );
};
