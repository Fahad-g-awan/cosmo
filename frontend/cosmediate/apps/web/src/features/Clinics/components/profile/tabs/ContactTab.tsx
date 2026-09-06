"use client";

import React, { useMemo } from "react";

import { useTranslations } from "@cosmediate/i18n/client";
import { Clinic } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import WorkingHoursView from "@web/components/profile/WorkingHoursView";
import TabsContainer from "@web/components/profile/TabsContainer";
import ContactForm from "@web/components/profile/ContactForm";
import { EntityMap } from "@web/components/EntityMap";

const ContactTab = ({ clinic }: { clinic: Clinic }) => {
  const profile = useTranslations("profile");
  const workingHours = useMemo(() => clinic.workingHours, [clinic]);

  return (
    <TabsContainer>
      <div
        className={cn("w-full flex flex-col justify-start items-start gap-4")}
      >
        <div className="font-bold text-xl leading-6 text-700 ">
          {profile.sections.contactUs}
        </div>

        <div
          className={cn(
            "w-full grid grid-cols-3 max-sm:grid-cols-1 justify-center items-center gap-6",
          )}
        >
          <ContactInfoContainer
            title={profile.sections.address}
            value={clinic?.completeAddress || profile.sections.notAvailable}
          />
          <ContactInfoContainer
            title={profile.sections.website}
            value={clinic?.website || profile.sections.notAvailable}
          />
          <ContactInfoContainer
            title={profile.sections.instagram}
            value={clinic?.instagramId || profile.sections.notAvailable}
          />
        </div>

        <EntityMap
          locations={
            clinic?.location
              ? [
                  {
                    lat: clinic?.location.lat,
                    lon: clinic?.location.lon,
                    id: clinic?.id,
                  },
                ]
              : []
          }
          mapZoom={15}
          mapHeight={400}
          mapType="grey"
        />

        {/* Working hours and Contact form */}
        <div
          className={cn(
            "w-full flex justify-center items-start gap-8 mt-5",
            "max-sm:flex-col max-lg:gap-6",
          )}
        >
          {workingHours && workingHours?.length > 0 && (
            <WorkingHoursView workingHours={workingHours} />
          )}
          <ContactForm />
        </div>
      </div>
    </TabsContainer>
  );
};

const ContactInfoContainer = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="text-sm leading-5 text-500">{title}</div>
      <div className="w-full h-[80px] font-medium text-sm leading-5 text-700">
        {value}
      </div>
    </div>
  );
};

export default ContactTab;
