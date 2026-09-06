"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, ProfileLoader, Toaster } from "@cosmediate/ui";
import { getAdminApi, updateAdminApi } from "@cosmediate/api";
import { Admin } from "@cosmediate/type-utils/auth";
import { useAuth } from "@cosmediate/auth";

import {
  ADMIN_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { withAdminImagePlaceholder } from "@app/lib/form-field-limits";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { AdminForm } from "../../components/form/AdminForm";
import { buildAdminFormData } from "../../lib/buildAdminFormData";
import { AdminFormValues } from "../../types/admin.types";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const UpdateAdmin = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const adminId = searchParams.id;

  const fetchAdmin = useCallback(async () => {
    if (!adminId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getAdminApi(
        { id: adminId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setAdmin(response.item);
      } else {
        showApiFailureToast(response, "Failed to load admin");
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      Toaster("An error occurred while loading admin data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [adminId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<AdminFormValues>) => {
    if (!adminId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const payload = await withAdminImagePlaceholder(data);
      const response = await updateAdminApi(
        buildAdminFormData(payload, { id: adminId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: ADMIN_FORM_FIELD_MAP,
        successMessage: "Admin record updated successfully",
        errorTitle: "Failed to update admin",
        onSuccess: () => router.push("/control-panel/admins"),
      });
    } catch (error) {
      console.error("Error updating admin:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update admin",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.controlPanel.admins.update || {
      title: "Update Admin",
      description: "Edit admin details",
    },
    "admin",
  );

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin, adminId]);

  if (isLoading && !admin) {
    return <ProfileLoader />;
  }

  if (!admin && !isLoading) {
    return (
      <NoDataFound
        message="Admin profile data not found"
        description="Please try again or contact support"
        icon={
          <LiaUserAltSlashSolid className="size-7 text-300" strokeWidth={1.5} />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Admin
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {admin?.fullName}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {admin && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <AdminForm
            ref={formRef}
            initialData={admin}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Admin"
            isUpdate={true}
          />
        </div>
      )}
    </div>
  );
};

export default UpdateAdmin;
