import React from "react";
import { Trash2 } from "lucide-react";

export const ConfirmDeleteDialog = ({
  primaryText,
  secondaryText,
}: {
  primaryText?: string;
  secondaryText?: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 mb-5">
      <div className="w-full flex items-center justify-center">
        <Trash2 className="size-10 text-danger mb-3" />
      </div>
      <p className="w-full text-center text-800 text-lg font-semibold">
        {primaryText ?? "Are you sure?"}
      </p>
      <p className="w-full text-center text-sm text-600">
        {secondaryText ?? "This action cannot be undone."}
      </p>
    </div>
  );
};
