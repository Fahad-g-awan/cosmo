import React, { useCallback, useEffect, useState } from "react";

import {
  useCommitRegistry,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { WorkingHoursItem as WorkingHoursItemType } from "@cosmediate/type-utils/shared";
import { Button, Separator } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { useDialog } from "@app/context/dialog/DialogProvider";

export const WorkingHoursSection = () => {
  const [savedWorkingHours, setSavedWorkingHours] =
    useState<WorkingHoursItemType[]>();

  const workingHours = useFormValue<WorkingHoursItemType[]>("workingHours");
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();

  const { openDialog, closeDialog } = useDialog();

  const handleEditWorkingHours = useCallback(() => {
    openDialog({
      dialogType: "working-hours-dialog",
      payload: {
        title: "Working Hours",
        cancelLabel: "Cancel",
        confirmLabel: "Save",
        onConfirm: () => {
          if (registry.commit("working-hours-section")) { closeDialog(); }
        },
        onCancel: () => setValue("workingHours", savedWorkingHours),
      },
    });
  }, [openDialog, savedWorkingHours, setValue, closeDialog, registry]);

  useEffect(() => {
    if (!savedWorkingHours) setSavedWorkingHours(workingHours);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingHours]);

  return (
    <React.Fragment>
      <div
        className={cn("w-full flex flex-col gap-4 items-start justify-start")}
      >
        <div className="pb-2 border-b w-full flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            Working hours
          </div>
          <Button
            variant={"ghost"}
            onClick={handleEditWorkingHours}
            type="button"
            className="text-xs font-semibold text-primary-accent/80 hover:text-primary-accent"
          >
            Edit
          </Button>
        </div>

        <div className="w-full flex flex-col items-center justify-start gap-4">
          {(workingHours || []).map(
            (item: WorkingHoursItemType, index: number) => (
              <div
                key={index}
                className="w-full flex flex-col items-center justify-start gap-4"
              >
                <WorkingHoursItem item={item} />

                {index !== workingHours.length - 1 && (
                  <Separator className="w-full bg-100" />
                )}
              </div>
            )
          )}
        </div>
      </div>

      <DialogRenderer />
    </React.Fragment>
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
