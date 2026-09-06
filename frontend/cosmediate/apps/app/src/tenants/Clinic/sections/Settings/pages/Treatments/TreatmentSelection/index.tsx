"use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  ScrollArea,
  Button,
  ButtonLoader,
  MultiSelect,
  NoDataFound,
} from "@cosmediate/ui";
import { Treatment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import TreatmentsManagementLayout from "../../../components/treatments/TreatmentsManagementLayout";
import { useTreatmentSelection } from "../../../hooks/treatments";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";

import { LuBriefcaseMedical } from "react-icons/lu";
import { X } from "lucide-react";

const ManageTreatments = () => {
  const [backupSelectedTreatments, setBackupSelectedTreatments] = useState<
    Treatment[]
  >([]);
  const [revertChanges, setRevertChanges] = useState(false);

  const { setPanelHeaderConfig } = usePanelHeader();

  const {
    syncSelection,
    setActiveCategory,
    setSelectedTreatments,
    selectedTreatmentsByCategory,
    selectedTreatments,
    selectableMainTreatments,
    allCategories,
    activeCategory,
    isLoading,
    isSubmitting,
  } = useTreatmentSelection();

  const selectableTreatmentOptions = useMemo(
    () =>
      selectableMainTreatments.map((treatment) => ({
        label: treatment.name,
        value: treatment.id,
      })),
    [selectableMainTreatments],
  );

  const handleTreatmentSelectionChange = (values: string[]) => {
    const newTreatments = selectableMainTreatments.filter((treatment) =>
      values.includes(treatment.id),
    );

    setSelectedTreatments((prev) => {
      const existingIds = new Set(prev.map((treatment) => treatment.id));

      return [
        ...prev,
        ...newTreatments.filter((treatment) => !existingIds.has(treatment.id)),
      ];
    });
  };

  const handleTreatmentSelectionRemove = (id: string) => {
    setSelectedTreatments((prev) =>
      prev.filter((treatment) => treatment.id !== id),
    );
  };

  const handleCancel = () => {
    if (activeCategory) {
      setRevertChanges(true);
    }
  };

  const handleSubmit = async () => {
    await syncSelection();
    setBackupSelectedTreatments(selectedTreatments);
  };

  useEffect(() => {
    if (
      backupSelectedTreatments.length === 0 &&
      selectedTreatments.length > 0
    ) {
      setBackupSelectedTreatments(selectedTreatments);
    }
  }, [selectedTreatments, backupSelectedTreatments]);

  useEffect(() => {
    if (revertChanges) {
      setSelectedTreatments(backupSelectedTreatments);
      setRevertChanges(false);
    }
  }, [revertChanges, backupSelectedTreatments, setSelectedTreatments]);

  useEffect(() => {
    setPanelHeaderConfig(
      panelHeaderConfig.clinic.settings.treatments.selection,
    );
  }, [setPanelHeaderConfig]);

  return (
    <TreatmentsManagementLayout
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      categories={allCategories}
      sectionTitle="Selecting Treatments"
      sectionDecription="Choose treatments your clinic offers. Assign specialists on the Assign tab."
      isLoading={
        isLoading &&
        allCategories.length === 0 &&
        selectedTreatments.length === 0
      }
      showNoDataFound={
        !isLoading &&
        allCategories.length === 0 &&
        selectedTreatments.length === 0
      }
    >
      <div
        className={cn(
          "w-full flex flex-col items-center justify-start gap-2.5 p-2 py-4",
          "bg-ghost-blue rounded-xl",
        )}
      >
        <div className="w-full px-3.75 flex flex-col items-start justify-start gap-2">
          <div className="w-full text-700 text-[15px] font-semibold capitalize">
            {activeCategory?.name}
          </div>
          <div className="w-full text-300 text-[11px] font-medium">
            Clinic offerings
          </div>
        </div>

        <ScrollArea className="w-full h-50">
          {selectedTreatmentsByCategory.length > 0 && (
            <div className="w-full flex flex-col border border-stroke rounded-xl bg-white overflow-hidden">
              {selectedTreatmentsByCategory.map((treatment: Treatment) => (
                <div
                  key={treatment.id}
                  className="w-full flex items-center justify-center border-b border-stroke last:border-none"
                >
                  <div className="w-full flex-1 p-3 capitalize text-600 text-[12px] font-medium">
                    {treatment.name}
                  </div>
                  <div className="w-[50px] shrink-0 flex items-center justify-center">
                    <X
                      className="size-3.5 cursor-pointer text-danger hover:text-red-500"
                      onClick={() =>
                        handleTreatmentSelectionRemove(treatment.id)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTreatmentsByCategory.length === 0 && (
            <div className="w-full p-5 flex flex-col items-center justify-center gap-5 border border-stroke rounded-xl bg-white">
              <NoDataFound
                message="Please select treatments from below"
                icon={<LuBriefcaseMedical className="size-6 text-500" />}
                className="p-0"
              />
            </div>
          )}
        </ScrollArea>

        <div className="w-full px-3.25 flex items-center justify-center">
          <MultiSelect
            options={selectableTreatmentOptions}
            values={[]}
            onChange={handleTreatmentSelectionChange}
            placeholder="Select Treatments"
            showSelectedItems={false}
            showSelectAll={false}
          />
        </div>

        <div className="w-full px-3.75 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            type="button"
            className="w-[50%]"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-[50%]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <ButtonLoader />}
            {!isSubmitting && <span>Save</span>}
          </Button>
        </div>
      </div>
    </TreatmentsManagementLayout>
  );
};

export default ManageTreatments;
