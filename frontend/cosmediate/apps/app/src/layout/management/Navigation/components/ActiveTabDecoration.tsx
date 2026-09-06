"use client";

import Image from "next/image";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

export const ActiveTabDecoration: React.FC<{
  isActiveLink: boolean;
  index: number;
}> = React.memo(({ isActiveLink, index }) => {
  if (!isActiveLink) return null;

  return (
    <>
      {/* Top */}
      <div
        className={cn(
          "absolute -top-[1.2rem] right-0",
          "max-lg:top-[-4.4rem] max-lg:left-[-5.6rem] max-lg:-rotate-90",
          "max-sm:top-[-3.8rem] max-sm:left-[-5rem]",
          { "lg:hidden": index === 0 },
          { "max-sm:hidden": index >= 4 }
        )}
      >
        <Image height={20} width={20} src="/sidebar/top-round.svg" alt="top" />
      </div>

      {/* Bottom */}
      <div
        className={cn(
          "absolute top-full right-0 !z-50",
          "max-lg:-rotate-90 max-lg:top-0 max-lg:-right-[1.2rem]",
          { "max-sm:hidden": index >= 4 }
        )}
      >
        <Image
          height={20}
          width={20}
          src="/sidebar/bottom-round.svg"
          alt="bottom"
        />
      </div>
    </>
  );
});

ActiveTabDecoration.displayName = "ActiveTabDecoration";
