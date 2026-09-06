"use client";

import Image from "next/image";

import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import { formatCompactDisplayName } from "../lib/formatCompactDisplayName";

/**
 * Shared identity header for profile dropdown / drawer.
 */
export const ProfileMenuHeader = ({ className }: { className?: string }) => {
  const { sessionUser } = useAuth();

  if (!sessionUser) return null;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-xl bg-ghost-blue/70 px-3 py-3",
        className,
      )}
    >
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
          {formatCompactDisplayName(sessionUser.fullName, 20)}
        </p>
        {sessionUser.email ? (
          <p className="text-[12px] font-medium leading-snug text-500 normal-case break-words">
            {sessionUser.email}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileMenuHeader;
