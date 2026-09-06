import React from "react";
import { Input, Label } from "@cosmediate/ui/index";

import { MessageSquareWarning } from "lucide-react";

export const NoShowAppointmentRequestDialog = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 mb-5">
      <div className="w-full flex items-center justify-center">
        <MessageSquareWarning className="size-14 text-primary-accent mb-3" />
      </div>
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <p className="w-full text-center text-800 text-xl leading-6 font-bold">
          No Show
        </p>
        <p className="w-full text-center text-500 text-sm leading-5 font-medium">
          Are you sure you want to mark this appointment as a no-show?
        </p>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1">
        <Label className="text-sm text-600">Add a note (optional)</Label>
        <Input className="w-full h-[45px]" placeholder="Enter reason" />
      </div>
    </div>
  );
};
