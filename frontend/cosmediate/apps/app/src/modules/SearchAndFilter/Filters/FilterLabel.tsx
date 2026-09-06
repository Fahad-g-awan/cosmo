import React from "react";

interface FilterLabelProps {
  label: string;
  description?: string;
}

export const FilterLabel = ({ label, description }: FilterLabelProps) => {
  return (
    <div className="w-full flex flex-col items-start justify-center gap-1">
      <h4 className="font-semibold text-sm leading-4 text-700">{label}</h4>
      {description && (
        <p className="text-xs text-600 leading-[17px] font-medium tracking-[0.22px]">
          {description}
        </p>
      )}
    </div>
  );
};
