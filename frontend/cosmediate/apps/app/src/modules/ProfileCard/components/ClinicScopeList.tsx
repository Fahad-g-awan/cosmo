"use client";

import Image from "next/image";

import type { Clinic } from "@cosmediate/type-utils/clinic";
import { cn } from "@cosmediate/ui/lib/utils";
import { Check } from "lucide-react";

import { formatClinicAddressLine } from "@app/lib/clinic-scope";
import { SmallLoader } from "@cosmediate/ui/index";

interface ClinicScopeListProps {
  items: Clinic[];
  activeClinicId: string | null;
  loading?: boolean;
  loadingMore?: boolean;
  error?: string | null;
  emptyText?: string;
  onSelect: (clinic: Clinic) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  className?: string;
}

export function ClinicScopeList({
  items,
  activeClinicId,
  loading = false,
  loadingMore = false,
  error = null,
  emptyText = "No clinics found",
  onSelect,
  onScroll,
  className,
}: ClinicScopeListProps) {
  return (
    <div
      className={cn("max-h-64 overflow-y-auto", className)}
      onScroll={onScroll}
    >
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-400">
          <SmallLoader showText={false} spinnerClassName="w-6 h-6 border-2" />
        </div>
      ) : error ? (
        <p className="px-3 py-4 text-center text-xs text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="px-3 py-4 text-center text-xs text-400">{emptyText}</p>
      ) : (
        <ul className="py-1">
          {items.map((clinic) => {
            const isActive = clinic.id === activeClinicId;
            const address = formatClinicAddressLine(
              clinic.city,
              clinic.completeAddress,
            );

            return (
              <li key={clinic.id}>
                <button
                  type="button"
                  onClick={() => onSelect(clinic)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-ghost-blue-2 max-sm:rounded-md",
                    isActive && "bg-primary-accent/10",
                  )}
                >
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ghost-blue-2">
                    <Image
                      src={clinic.logo || "/avatar.jpg"}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-800">
                      {clinic.name}
                    </p>
                    {address ? (
                      <p className="truncate text-[11px] text-400">{address}</p>
                    ) : null}
                  </div>

                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0 text-primary-accent",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {loadingMore ? (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-400">
          <SmallLoader showText={false} spinnerClassName="w-6 h-6 border-2" />
        </div>
      ) : null}
    </div>
  );
}
