import React, { useState, useCallback, useEffect } from "react";

import { Checkbox, ComboboxSelect, MultiSelect, Input } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { durationOptions } from "@app/constants/time";
import { SubTreatmentType } from "../../../../types/treatment.types";
import { formatDurationDisplay } from "../../../../lib/utils";
import {
  SUB_TREATMENT_ACTIONS_WIDTH,
  subTreatmentFieldsClassName,
} from "./SubTreatmentsHeader";

import { FiPlus } from "react-icons/fi";
import { X } from "lucide-react";

interface SubTreatmentRowProps {
  subTreatment: SubTreatmentType;
  clinicTreatmentId: string;
  subTrtIndex: number;
  isLast: boolean;
  canAdd?: boolean;
  treatmentBrandOptions: { label: string; value: string }[];
  onFieldChange: (
    clinicTreatmentId: string,
    subTrtIndex: number,
    field: string,
    value: string | string[] | boolean | number,
  ) => void;
  onRemove: (clinicTreatmentId: string, subTrtIndex: number) => void;
  onAdd: (clinicTreatmentId: string) => void;
}

const SubTreatmentRow = React.memo(
  ({
    subTreatment,
    clinicTreatmentId,
    subTrtIndex,
    isLast,
    canAdd = false,
    treatmentBrandOptions,
    onFieldChange,
    onRemove,
    onAdd,
  }: SubTreatmentRowProps) => {
    const [localName, setLocalName] = useState(subTreatment.name);
    const [localPrice, setLocalPrice] = useState(
      String(subTreatment.price ?? 0),
    );

    useEffect(() => {
      setLocalName(subTreatment.name);
    }, [subTreatment.name]);

    useEffect(() => {
      setLocalPrice(String(subTreatment.price ?? 0));
    }, [subTreatment.price]);

    const handleNameBlur = useCallback(() => {
      onFieldChange(clinicTreatmentId, subTrtIndex, "name", localName);
    }, [clinicTreatmentId, subTrtIndex, localName, onFieldChange]);

    const handlePriceChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        if (raw === "") {
          setLocalPrice("");
          return;
        }

        // Digits and optional single decimal only — no negatives/exponents
        if (!/^\d*\.?\d*$/.test(raw)) return;

        // Drop leading zeros so typing over 0 becomes "5" not "05"
        const next = raw.replace(/^0+(?=\d)/, "");
        setLocalPrice(next === "" ? "0" : next);
      },
      [],
    );

    const handlePriceBlur = useCallback(() => {
      const parsed = Number(localPrice);
      const nextPrice =
        localPrice === "" || Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
      setLocalPrice(String(nextPrice));
      onFieldChange(clinicTreatmentId, subTrtIndex, "price", nextPrice);
    }, [clinicTreatmentId, subTrtIndex, localPrice, onFieldChange]);

    const handlePriceKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
          e.preventDefault();
        }
      },
      [],
    );

    return (
      <div className="flex w-max items-stretch border-b border-stroke">
        <div className={subTreatmentFieldsClassName}>
          <div className="min-w-0 self-stretch px-2 py-2 sm:px-2.5 border-r border-stroke/50 flex items-center">
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Treatment name"
              className={cn(
                "w-full min-w-0 p-0 text-600 text-[12px] font-medium leading-[16px] placeholder:text-300 capitalize",
                "border-0 outline-none rounded-none bg-transparent",
              )}
            />
          </div>

          <div className="relative min-w-0 self-stretch px-2 py-2 pl-6 sm:px-2.5 sm:pl-7 border-r border-stroke/50 flex items-center">
            <span className="absolute left-2 sm:left-2.5 text-600 text-[12px] font-medium">
              €
            </span>
            <Input
              type="text"
              inputMode="decimal"
              value={localPrice}
              onChange={handlePriceChange}
              onBlur={handlePriceBlur}
              onFocus={(e) => e.target.select()}
              onKeyDown={handlePriceKeyDown}
              className={cn(
                "w-full min-w-0 p-0 text-600 text-[12px] font-medium leading-[16px]",
                "border-0 outline-none rounded-none bg-transparent",
              )}
            />
          </div>

          <div className="min-w-0 self-stretch px-2.5 py-2 sm:px-3 border-r border-stroke/50 flex items-center hover:bg-ghost-blue-2">
            <ComboboxSelect
              options={durationOptions}
              value={subTreatment.duration}
              onValueChange={(value: string) =>
                onFieldChange(clinicTreatmentId, subTrtIndex, "duration", value)
              }
              placeholder="Select Duration"
              buttonClassName="border-none bg-transparent p-0 w-full hover:bg-ghost-blue-2"
              renderSelected={(option) => {
                if (!option) return option;
                return formatDurationDisplay(option.value);
              }}
            />
          </div>

          <div className="min-w-0 self-stretch px-2.5 py-2 sm:px-3 border-r border-stroke/50 flex items-center hover:bg-ghost-blue-2">
            <MultiSelect
              options={treatmentBrandOptions}
              onChange={(values: string[]) =>
                onFieldChange(
                  clinicTreatmentId,
                  subTrtIndex,
                  "brandIds",
                  values,
                )
              }
              values={subTreatment.brandIds ?? []}
              placeholder="Select Brand/s"
              label="Brand"
              showSelectedItems={false}
              showSelectAll={true}
              triggerClassName="border-none bg-transparent p-0 w-full hover:bg-ghost-blue-2"
            />
          </div>

          <div className="flex items-center justify-center self-stretch border-r border-stroke/50">
            <Checkbox
              id={`available-${clinicTreatmentId}-${subTrtIndex}`}
              checked={subTreatment.available}
              onCheckedChange={(checked) =>
                onFieldChange(
                  clinicTreatmentId,
                  subTrtIndex,
                  "available",
                  checked === true,
                )
              }
              aria-label="Available"
            />
          </div>
        </div>

        <div
          className={cn(
            SUB_TREATMENT_ACTIONS_WIDTH,
            "sticky right-0 z-20 shrink-0 flex items-center justify-center self-stretch border-l border-stroke/50 bg-white shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.08)]",
          )}
        >
          {!isLast ? (
            <X
              className="size-3.5 cursor-pointer text-danger hover:text-red-500 transition-colors"
              onClick={() => onRemove(clinicTreatmentId, subTrtIndex)}
            />
          ) : (
            <FiPlus
              className={cn(
                "size-5 transition-colors",
                canAdd
                  ? "cursor-pointer text-primary-accent hover:text-primary-accent-dark"
                  : "cursor-not-allowed text-300 opacity-50",
              )}
              onClick={() => {
                if (!canAdd) return;
                onAdd(clinicTreatmentId);
              }}
              aria-disabled={!canAdd}
            />
          )}
        </div>
      </div>
    );
  },
);

SubTreatmentRow.displayName = "SubTreatmentRow";

export default SubTreatmentRow;
