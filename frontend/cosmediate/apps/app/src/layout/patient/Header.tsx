import Image from "next/image";
import React from "react";

import type { SessionUser } from "@cosmediate/type-utils";
import { SiteContainer } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { Mail, Phone } from "lucide-react";

const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center bg-linear-to-tl from-[#F2F5FF] via-[#F6F8FF] to-[#F2F5FF]",
      )}
    >
      <SiteContainer>
        <div
          className={cn(
            "w-full container py-6.5 flex flex-col justify-center items-center gap-6",
            "max-lg:gap-4 max-sm:gap-2",
          )}
        >
          {children}
        </div>
      </SiteContainer>
    </div>
  );
};

const HeaderContent = ({ sessionUser }: { sessionUser: SessionUser }) => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-start",
        "max-lg:flex-col max-lg:justify-center",
        "gap-8 max-lg:gap-4",
      )}
    >
      <div
        className={cn("w-[135px] aspect-square rounded-full overflow-hidden")}
      >
        <Image
          src={sessionUser?.image || "/avatar.jpg"}
          alt={sessionUser?.firstName}
          width={200}
          height={200}
          className={cn("w-full h-full object-cover")}
        />
      </div>

      <div
        className={cn(
          "w-full flex flex-col items-start justify-center gap-3 max-lg:items-center",
        )}
      >
        {/* Name */}
        <div
          className={cn(
            "w-full flex items-center justify-start",
            "max-lg:justify-center",
            "text-3xl text-wrap leading-[36px] font-bold text-900",
          )}
        >
          {sessionUser?.fullName}
        </div>

        <div
          className={cn(
            "w-full flex items-center justify-start",
            "max-lg:justify-center max-sm:flex-col",
            "text-xs text-600 leading-[17px]",
            "max-sm:text-[11px] max-sm:leading-[17px] tracking-tight",
            "gap-20 max-lg:gap-5 max-sm:gap-3",
          )}
        >
          <div className="w-fit flex flex-col items-start justify-center gap-1.5 max-lg:flex-row max-lg:items-center">
            <div className="flex items-center gap-1">
              <Mail className="size-3" />
              <span>Email</span>
            </div>
            <span className="font-medium">{sessionUser?.email}</span>
          </div>

          <div className="w-fit flex flex-col items-start justify-center gap-1.5 max-lg:flex-row max-lg:items-center">
            <div className="flex items-center gap-1">
              <Phone className="size-3" />
              <span>Telephone</span>
            </div>
            <span className="font-medium">{sessionUser?.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

Header.HeaderContent = HeaderContent;

export default Header;
