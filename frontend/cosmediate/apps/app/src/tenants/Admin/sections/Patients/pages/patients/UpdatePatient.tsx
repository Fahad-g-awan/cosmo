"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Patient } from "@cosmediate/type-utils/auth";

import { NoDataFound, ProfileLoader, Toaster } from "@cosmediate/ui";
import { getPatientApi, updatePatientApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  PATIENT_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { PatientForm } from "../../components/form/PatientForm";
import { buildPatientFormData } from "../../lib/buildPatientFormData";
import { PatientFormValues } from "../../types/patient.types";

import { LiaUserAltSlashSolid } from "react-icons/lia";

const UpdatePatient = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const patientId = searchParams.id;

  const fetchPatient = useCallback(async () => {
    if (!patientId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getPatientApi(
        { id: patientId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setPatient(response.item);
      } else {
        showApiFailureToast(response, "Failed to load patient");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      Toaster("An error occurred while loading patient data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: Partial<PatientFormValues>) => {
    if (!patientId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updatePatientApi(
        buildPatientFormData(
          data,
          { id: patientId },
          { clearEmptyOptionals: true },
        ),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: PATIENT_FORM_FIELD_MAP,
        successMessage: "Patient updated successfully",
        errorTitle: "Failed to update patient",
        onSuccess: () => router.push("/patients"),
      });
    } catch (error) {
      console.error("Error updating patient:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update patient",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.patients?.update || {
      title: "Update Patient",
      description: "Edit patient details",
    },
    "patient",
  );

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient, patientId]);

  if (isLoading && !patient) {
    return <ProfileLoader />;
  }

  if (!patient && !isLoading) {
    return (
      <NoDataFound
        message="Patient data not found"
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
          Update Patient
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {patient?.fullName}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {patient && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <PatientForm
            ref={formRef}
            initialData={patient}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Patient"
            isUpdate={true}
          />
        </div>
      )}
    </div>
  );
};

export default UpdatePatient;
