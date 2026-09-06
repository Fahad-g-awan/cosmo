"use client";

import Image from "next/image";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import { useAboutPageData } from "../../hooks/useMarketingPageData";
import InfoCard from "../InfoCard";

const MissionSection = () => {
  const { missionData } = useAboutPageData();

  return (
    <div
      className={cn(
        "w-full grid grid-cols-3 max-lg:grid-cols-1 items-center justify-center gap-8 max-sm:gap-4",
        "max-lg:flex-col"
      )}
    >
      {missionData.map((item, index) => {
        if ("title" in item && item.title) {
          return (
            <InfoCard
              key={index}
              className={cn(item.className)}
              image={item.image}
              title={item.title}
              description={item.description}
              href={item.link?.href}
              linkLabel={item.link?.linkLabel ?? ""}
              variant={"primary"}
            />
          );
        }

        return (
          <div
            key={index}
            className={cn(
              "w-full h-full flex items-center justify-center max-lg:hidden",
              item.className
            )}
          >
            <Image
              className="w-full h-full object-cover rounded-xl "
              src={item.image}
              alt={"alt" in item ? item.alt || "" : ""}
              height={500}
              width={500}
            />
          </div>
        );
      })}
    </div>
  );
};

export default MissionSection;
