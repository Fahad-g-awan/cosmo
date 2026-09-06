"use client";

import { useState } from "react";

import type { Clinic } from "@cosmediate/type-utils/clinic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@cosmediate/ui";
import { Building2 } from "lucide-react";

import { clinicToActiveSummary } from "@app/lib/clinic-scope";
import { useManagerClinicScopeList } from "@app/hooks/useManagerClinicScopeList";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { ClinicScopeList } from "./ClinicScopeList";

interface ClinicScopeSwitcherMobileProps {
  onClinicSelected?: () => void;
}

export function ClinicScopeSwitcherMobile({
  onClinicSelected,
}: ClinicScopeSwitcherMobileProps) {
  const { activeClinicId, selectActiveClinic } = useWorkspace();
  const [open, setOpen] = useState(false);

  const {
    items,
    loading,
    loadingMore,
    error,
    search,
    setSearch,
    handleScroll,
  } = useManagerClinicScopeList({ open });

  const handleSelect = (clinic: Clinic) => {
    selectActiveClinic(clinicToActiveSummary(clinic));
    onClinicSelected?.();
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={open ? "clinics" : ""}
      onValueChange={(value) => setOpen(value === "clinics")}
      className="w-full"
    >
      <AccordionItem value="clinics" className="border-none">
        <AccordionTrigger className="cursor-pointer py-2 hover:bg-cloud hover:no-underline">
          <div className="flex items-center gap-4">
            <Building2 className="size-4 text-800" />
            <span className="text-sm font-semibold text-800">Clinics</span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-2">
          <div className="mb-2 px-1">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clinics..."
              className="w-full rounded-lg border border-ghost-blue-2 bg-white px-3 py-2 text-xs text-700 outline-none focus:border-primary-accent"
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
            className="max-h-52"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
