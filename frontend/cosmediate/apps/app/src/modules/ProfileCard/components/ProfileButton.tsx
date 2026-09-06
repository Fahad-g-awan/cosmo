"use client";

import Image from "next/image";

import { cn } from "@cosmediate/ui/lib/utils";
import { SmallLoader } from "@cosmediate/ui/index";
import { useAuth } from "@cosmediate/auth";

import { shouldShowClinicScopeInHeader } from "@app/lib/clinic-scope";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { formatCompactDisplayName } from "../lib/formatCompactDisplayName";

import { IoIosArrowDown } from "react-icons/io";

const ProfileButton = ({ isDropdownOpen }: { isDropdownOpen: boolean }) => {
  const { sessionUser, userRole } = useAuth();
  const { kind, activeClinicSummary } = useWorkspace();

  const showClinicScope = shouldShowClinicScopeInHeader(userRole, kind);

  if (!sessionUser) {
    return <SmallLoader showText={false} spinnerClassName="w-6 h-6 border-2" />;
  }

  const displayName = formatCompactDisplayName(sessionUser.fullName, 18);
  const clinicName = activeClinicSummary?.name
    ? formatCompactDisplayName(activeClinicSummary.name, 20)
    : "";

  return (
    <div
      className={cn(
        "flex max-w-[250px] items-center gap-2 rounded-xl px-2 py-1.5",
        "cursor-pointer transition-all duration-300",
        "hover:bg-primary-accent/5",
        "max-lg:max-w-none",
        isDropdownOpen && "bg-primary-accent/10",
      )}
    >
      <div className="size-9 shrink-0 overflow-hidden rounded-full max-lg:size-8">
        <Image
          src={sessionUser.image || "/avatar.jpg"}
          alt={sessionUser.fullName || "User"}
          width={36}
          height={36}
          className="size-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 max-lg:hidden">
        <p className="truncate text-sm font-medium capitalize leading-tight text-800">
          {displayName}
        </p>

        {showClinicScope && clinicName ? (
          <p className="truncate capitalize text-[11px] leading-tight text-500">
            {clinicName}
          </p>
        ) : null}
      </div>

      <IoIosArrowDown
        className={cn(
          "size-4 shrink-0 text-400 transition-transform duration-200",
          isDropdownOpen && "rotate-180",
        )}
      />
    </div>
  );
};

export default ProfileButton;
