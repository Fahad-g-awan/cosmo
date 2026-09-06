"use client";

import { ButtonLoader } from "@cosmediate/ui";

export const ShowMoreLoader = () => {
  return (
    <div className="w-full flex items-center justify-start gap-2 text-xs text-500">
      <span>Loading</span> <ButtonLoader variant="light" />
    </div>
  );
};
