"use client";

import Image from "next/image";

import { Separator } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import {
  formatClinicAddressLine,
  shouldShowClinicScopeInHeader,
} from "@app/lib/clinic-scope";
import { useWorkspace } from "@app/context/WorkspaceContext";

/**
 * Shared identity header for profile dropdown / drawer.
 */
export const ProfileMenuHeader = ({ className }: { className?: string }) => {
  const { sessionUser, userRole } = useAuth();
  const { kind, activeClinicSummary } = useWorkspace();

  if (!sessionUser) return null;

  const showClinicScope = shouldShowClinicScopeInHeader(userRole, kind);
  const clinicAddress = activeClinicSummary
    ? formatClinicAddressLine(
        activeClinicSummary.city,
        activeClinicSummary.completeAddress,
      )
    : "";

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-xl bg-ghost-blue-2 px-3 py-3",
        className,
      )}
    >
      <div className="flex w-full items-start gap-3">
        <div className="size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-white">
          <Image
            src={sessionUser.image || "/avatar.jpg"}
            alt={sessionUser.fullName || "User"}
            width={44}
            height={44}
            className="size-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm font-semibold leading-snug text-800 capitalize break-words">
            {sessionUser.fullName}
          </p>

          {sessionUser.email ? (
            <p className="text-[12px] font-medium leading-snug text-500 normal-case break-words">
              {sessionUser.email}
            </p>
          ) : null}
        </div>
      </div>

      {showClinicScope && activeClinicSummary ? (
        <>
          <Separator className="my-3 w-full" />

          <div className="flex w-full items-start gap-3">
            <div className="size-11 shrink-0 overflow-hidden rounded-lg ring-2 ring-white bg-white">
              <Image
                src={activeClinicSummary.logo || "/avatar.jpg"}
                alt={activeClinicSummary.name || "Clinic"}
                width={44}
                height={44}
                className="size-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[12px] font-medium leading-snug text-700 break-words capitalize">
                {activeClinicSummary.name}
              </p>
              {clinicAddress ? (
                <p className="text-[11px] leading-snug text-400 normal-case break-words">
                  {clinicAddress}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ProfileMenuHeader;
