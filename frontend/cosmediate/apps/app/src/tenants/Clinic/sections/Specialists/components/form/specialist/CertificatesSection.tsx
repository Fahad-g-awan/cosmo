import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import {
  useCommitRegistry,
  useFormError,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { Certificates } from "@cosmediate/type-utils/shared";
import { Button } from "@cosmediate/ui";
import { FieldError } from "@cosmediate/form-ui";
import { cn } from "@cosmediate/ui/lib/utils";

import { PLACEHOLDER_IMAGE_SRC } from "@app/lib/form-field-limits";

import { Plus } from "lucide-react";

type CertificateItem = Required<Omit<Certificates, "certificateImage">> & {
  certificateImage?: File | string;
};

export const CertificatesSection = () => {
  const certificates = useFormValue<CertificateItem[]>("certificates");
  const certificatesError = useFormError("certificates");
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();

  const { openDialog, closeDialog } = useDialog();

  const hasCertificates = (certificates?.length ?? 0) > 0;

  const handleOpenCertificates = useCallback(() => {
    const snapshot = certificates;
    openDialog({
      dialogType: "certificates-dialog",
      payload: {
        title: "Certificates",
        cancelLabel: "Cancel",
        confirmLabel: "Save",
        onConfirm: () => {
          if (registry.commit("certificates-section")) {
            closeDialog();
          }
        },
        onCancel: () => setValue("certificates", snapshot ?? []),
      },
    });
  }, [openDialog, setValue, closeDialog, registry, certificates]);

  return (
    <React.Fragment>
      <div
        className={cn("w-full flex flex-col gap-4 items-start justify-start")}
      >
        <div className="pb-2 border-b w-full flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            Certificates
          </div>
          {hasCertificates && (
            <Button
              variant={"ghost"}
              onClick={handleOpenCertificates}
              type="button"
              className="text-xs font-semibold text-primary-accent/80 hover:text-primary-accent"
            >
              Edit
            </Button>
          )}
        </div>

        {!hasCertificates && (
          <p className="text-xs text-500">
            No certificates yet. Click add to create the first one.
          </p>
        )}

        {hasCertificates && (
          <div className="w-full flex items-start justify-start gap-6 overflow-x-auto overflow-lite p-2">
            {(certificates || []).map((item, index: number) => (
              <CertificateCard key={index} item={item} />
            ))}
          </div>
        )}

        <FieldError error={certificatesError} />

        {!hasCertificates && (
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenCertificates}
          >
            <Plus
              className="size-4.5 shrink-0 text-primary-accent"
              strokeWidth={2.5}
            />
            <span className="text-600 font-semibold!">Add Certificate</span>
          </Button>
        )}
      </div>

      <DialogRenderer />
    </React.Fragment>
  );
};

const CertificateCard = ({ item }: { item: CertificateItem }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!item?.certificateImage) {
      setPreview(null);
      return;
    }

    if (typeof item.certificateImage === "string") {
      setPreview(item.certificateImage);
      return;
    }

    if (item.certificateImage instanceof File) {
      const url = URL.createObjectURL(item.certificateImage);
      setPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [item?.certificateImage]);

  return (
    <div
      className={cn(
        "relative w-[150px] h-[110px] shrink-0 flex items-center justify-center bg-ghost-blue border border-stroke rounded-lg",
      )}
    >
      <Image
        src={preview || PLACEHOLDER_IMAGE_SRC}
        alt={`certificate image ${item.name}`}
        height={200}
        width={200}
        className="w-full h-full absolute -top-2 left-2 rounded-lg object-cover shadow border border-stroke"
      />
      <div className="w-full h-full bg-ghost-blue-2/70 absolute -top-2 left-2 rounded-lg"></div>
      <div
        className={cn(
          "absolute w-[90%] h-[80px] bottom-3.5 left-3.5 flex items-end justify-start text-sm text-wrap text-700 font-bold leading-[17px] overflow-y-auto overflow-lite uppercase",
        )}
      >
        {item.name}
      </div>
    </div>
  );
};
