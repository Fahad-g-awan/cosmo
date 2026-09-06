"use client";

import { useState } from "react";

import type { Clinic } from "@cosmediate/type-utils/clinic";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@cosmediate/ui";
import { Building2 } from "lucide-react";

import { clinicToActiveSummary } from "@app/lib/clinic-scope";
import { useManagerClinicScopeList } from "@app/hooks/useManagerClinicScopeList";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicScopeList } from "./ClinicScopeList";

interface ClinicScopeSwitcherDesktopProps {
  onClinicSelected?: () => void;
}

export function ClinicScopeSwitcherDesktop({
  onClinicSelected,
}: ClinicScopeSwitcherDesktopProps) {
  const { activeClinicId, selectActiveClinic } = useWorkspace();
  const [subOpen, setSubOpen] = useState(false);

  const {
    items,
    loading,
    loadingMore,
    error,
    search,
    setSearch,
    handleScroll,
  } = useManagerClinicScopeList({ open: subOpen });

  const handleSelect = (clinic: Clinic) => {
    selectActiveClinic(clinicToActiveSummary(clinic));
    onClinicSelected?.();
  };

  return (
    <DropdownMenuSub open={subOpen} onOpenChange={setSubOpen}>
      <DropdownMenuSubTrigger className="cursor-pointer rounded-lg px-2 py-3 text-xs">
        <Building2 className="size-4 text-800" />
        <span>Clinics</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent
        className="w-72 overflow-hidden rounded-xl p-0 shadow-lg"
        sideOffset={15}
      >
        <div className="border-b border-ghost-blue-2 p-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search clinics..."
            className="w-full rounded-lg border border-ghost-blue-2 bg-white px-3 py-2 text-xs text-700 outline-none focus:border-primary-accent"
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>

        <ClinicScopeList
          items={items}
          activeClinicId={activeClinicId}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          onSelect={handleSelect}
          onScroll={handleScroll}
        />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
