"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createAnnouncementApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  ANNOUNCEMENT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { AnnouncementForm } from "../components/AnnouncementForm";
import { buildAnnouncementCreateBody } from "../lib/build-announcement-request";
import type { AnnouncementFormValues } from "../types/announcement.types";

const AddAnnouncement = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);
  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: AnnouncementFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);
      const response = await createAnnouncementApi(
        buildAnnouncementCreateBody(data),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: ANNOUNCEMENT_FORM_FIELD_MAP,
        successMessage: "Announcement created successfully",
        errorTitle: "Failed to create announcement",
        validationErrorTitle: "Please fix the highlighted fields",
        onSuccess: () => router.push("/settings/platform/announcements"),
      });
    } catch (error) {
      console.error("Error creating announcement:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create announcement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.settings.platform.announcements.add,
    "announcement",
  );

  return (
    <div className="flex w-full flex-col items-center justify-start gap-5">
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add announcement
        </h1>
        <p className="text-sm text-400">
          Create a banner announcement for dashboard, web, or blog surfaces.
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <AnnouncementForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create announcement"
        />
      </div>
    </div>
  );
};

export default AddAnnouncement;
