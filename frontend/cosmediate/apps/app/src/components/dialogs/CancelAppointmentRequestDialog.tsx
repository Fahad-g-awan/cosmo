import React from "react";
import { Input, Label } from "@cosmediate/ui/index";
import { CalendarX2 } from "lucide-react";

export const CancelAppointmentRequestDialog = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 mb-5">
      <div className="w-full flex items-center justify-center">
        <CalendarX2 className="size-14 text-danger mb-3" />
      </div>
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <p className="w-full text-center text-800 text-lg leading-6 font-bold">
          Cancel Appointment
        </p>
        <p className="w-full text-center text-500 text-sm leading-5 font-medium">
          Are you sure you want to cancel this appointment?
        </p>
      </div>

      <div className="w-full flex flex-col items-start justify-start gap-1">
        <Label className="text-sm text-600">Reason for cancellation</Label>
        <Input className="w-full h-[45px]" placeholder="Enter reason" />
      </div>
    </div>
  );
};
