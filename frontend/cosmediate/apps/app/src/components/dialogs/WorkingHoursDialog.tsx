import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";

import {
  useCommitRegistry,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { WorkingHoursItem } from "@cosmediate/type-utils/shared";
import {
  Button,
  ComboboxSelect,
  ComboOption,
  Input,
  ScrollArea,
  Separator,
} from "@cosmediate/ui";
import { FieldError } from "@cosmediate/form-ui";

import { DEFAULT_WORKING_HOURS } from "@app/tenants/Admin/sections/ClinicManagement/constants/clinic.constants";
import { validateWorkingHours } from "@app/tenants/Admin/sections/ClinicManagement/lib/clinic-section-validation";

import { HiOutlineTrash } from "react-icons/hi";

const availabilityOptions = [
  { label: "Available", value: "1" },
  { label: "Not Available", value: "0" },
] satisfies ComboOption[];

export const WorkingHoursDialog = () => {
  const [, forceUpdate] = useState(0);
  const [localError, setLocalError] = useState<string | undefined>();

  const workingHours = useFormValue<WorkingHoursItem[]>("workingHours");
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();

  const localHoursRef = useRef<WorkingHoursItem[]>(
    workingHours && workingHours.length > 0
      ? workingHours
      : DEFAULT_WORKING_HOURS,
  );

  useEffect(() => {
    if (workingHours && workingHours.length > 0) {
      localHoursRef.current = workingHours;
    }
  }, [workingHours]);

  const handleTimeChange = useCallback(
    (index: number, field: "startTime" | "endTime", value: string) => {
      localHoursRef.current = localHoursRef.current.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      setLocalError(undefined);
      forceUpdate((n) => n + 1);
    },
    [],
  );

  const handleAvailableChange = useCallback(
    (index: number, available: boolean) => {
      localHoursRef.current = localHoursRef.current.map((item, i) =>
        i === index ? { ...item, available } : item,
      );
      setLocalError(undefined);
      forceUpdate((n) => n + 1);
    },
    [],
  );

  useEffect(() => {
    registry.register("working-hours-section", {
      commit: () => {
        const error = validateWorkingHours(localHoursRef.current);
        if (error) {
          setLocalError(error);
          setValue("workingHours", localHoursRef.current);
          return false;
        }

        setLocalError(undefined);
        if (localHoursRef.current.length > 0) {
          setValue("workingHours", localHoursRef.current);
        }
        return true;
      },
    });
    return () => registry.unregister("working-hours-section");
  }, [registry, setValue]);

  return (
    <ScrollArea className="h-[55dvh]">
      <div className="w-full flex flex-col items-center justify-start gap-4">
        {localHoursRef.current?.map((item, index) => (
          <div
            key={item.weekDay}
            className="w-full flex flex-col items-center justify-start gap-4"
          >
            <div className="w-full grid grid-cols-3 max-sm:grid-cols-1 items-center justify-center gap-2">
              <span className="w-full col-span-1 text-sm text-700 capitalize line-clamp-1 flex items-center justify-start">
                {item.weekDay}
              </span>

              <div className="w-full sm:col-span-2 flex items-center justify-end gap-2">
                {!item.available && (
                  <div className="flex items-center gap-2">
                    <ComboboxSelect
                      options={availabilityOptions}
                      value={item.available ? "1" : "0"}
                      onValueChange={(value) =>
                        handleAvailableChange(index, value === "1")
                      }
                      placeholder={"Set Availability"}
                      clearable
                      required
                    />
                  </div>
                )}
                {item.available && (
                  <React.Fragment>
                    <Input
                      type="time"
                      value={item.startTime || ""}
                      onChange={(e) =>
                        handleTimeChange(index, "startTime", e.target.value)
                      }
                      className="w-full text-xs"
                    />
                    <Separator className="w-5 bg-300" />
                    <Input
                      type="time"
                      value={item.endTime || ""}
                      onChange={(e) =>
                        handleTimeChange(index, "endTime", e.target.value)
                      }
                      className="w-full text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="text-primary-accent/80 hover:text-primary-accent/100"
                      onClick={() => handleAvailableChange(index, false)}
                    >
                      <HiOutlineTrash className="size-4" />
                    </Button>
                  </React.Fragment>
                )}
              </div>
            </div>

            {index !== localHoursRef.current?.length - 1 && (
              <Separator className="w-full bg-200/80" />
            )}
          </div>
        ))}
        <FieldError error={localError} />
      </div>
    </ScrollArea>
  );
};
