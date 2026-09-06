"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

import { NoDataFound, BlogsFormLoader, Toaster } from "@cosmediate/ui";
import {
  getManagementAnnouncementApi,
  updateAnnouncementApi,
} from "@cosmediate/api";
import { Announcement } from "@cosmediate/type-utils";
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
import { buildAnnouncementUpdateBody } from "../lib/build-announcement-request";
import type { AnnouncementFormValues } from "../types/announcement.types";

const UpdateAnnouncement = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();
  const searchParams = useParams<{ id: string }>();
  const announcementId = searchParams.id;

  const handleFetchAnnouncement = useCallback(async () => {
    if (!announcementId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getManagementAnnouncementApi(
        { id: announcementId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setAnnouncement(response.item);
      } else {
        showApiFailureToast(response, "Failed to load announcement");
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
      Toaster("An error occurred while loading announcement data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [announcementId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: AnnouncementFormValues) => {
    if (!announcementId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);
      const response = await updateAnnouncementApi(
        buildAnnouncementUpdateBody(data, announcementId),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: ANNOUNCEMENT_FORM_FIELD_MAP,
        successMessage: "Announcement updated successfully",
        errorTitle: "Failed to update announcement",
        validationErrorTitle: "Please fix the highlighted fields",
        onSuccess: () => router.push("/settings/platform/announcements"),
      });
    } catch (error) {
      console.error("Error updating announcement:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update announcement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.settings.platform.announcements.update,
    "announcement",
  );

  useEffect(() => {
    handleFetchAnnouncement();
  }, [handleFetchAnnouncement]);

  if (isLoading && !announcement) {
    return <BlogsFormLoader />;
  }

  if (!announcement && !isLoading) {
    return (
      <NoDataFound
        message="Announcement not found"
        description="Please try again or contact support"
        icon={<Megaphone className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-start gap-5">
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update announcement
        </h1>
        <p className="text-sm text-400">Edit {announcement?.title}</p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {announcement ? (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <AnnouncementForm
            ref={formRef}
            initialData={announcement}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update announcement"
            isUpdate
          />
        </div>
      ) : null}
    </div>
  );
};

export default UpdateAnnouncement;
