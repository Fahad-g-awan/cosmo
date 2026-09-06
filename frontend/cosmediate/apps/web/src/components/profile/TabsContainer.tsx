import React from "react";

import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { BookAppointmentCard } from "./BookAppointmentCard";

const TabsContainer = ({
  children,
  showBookAppointmentCard = true,
}: {
  children: React.ReactNode;
  showBookAppointmentCard?: boolean;
}) => {
  return (
    <SiteContainer>
      <div
        className={cn(
          "w-full mt-8 mb-30 flex items-start justify-center gap-8",
          "max-lg:flex-col max-lg:gap-6 max-sm:gap-4",
        )}
      >
        <div className="w-[70%] max-xl:w-[60%] max-lg:w-full mb-20 max-lg:mb-35 flex flex-col items-start justify-start gap-6">
          {children}
        </div>

        <div
          className={cn(
            "w-[30%] max-xl:w-[40%] relative max-lg:w-full flex flex-col items-center justify-start",
          )}
        >
          {showBookAppointmentCard && (
            <div className={cn("w-full absolute -top-25")}>
              <BookAppointmentCard />
            </div>
          )}
        </div>
      </div>
    </SiteContainer>
  );
};

export default TabsContainer;
