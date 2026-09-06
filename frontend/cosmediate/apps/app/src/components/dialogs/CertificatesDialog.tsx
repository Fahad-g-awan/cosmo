import { useCallback, useEffect, useState } from "react";

import {
  useCommitRegistry,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { Certificates } from "@cosmediate/type-utils";
import {
  Button,
  DatePicker,
  ImageUpload,
  ImageUploadError,
  Input,
  Label,
  ScrollArea,
  Toaster,
} from "@cosmediate/ui";
import { FieldError, FormGrid } from "@cosmediate/form-ui";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  type CertificateField,
  isBlankCertificate,
  validateCertificates,
} from "@app/tenants/Admin/sections/ClinicManagement/lib/clinic-section-validation";

import { Plus, X } from "lucide-react";

type CertificateItem = Required<Omit<Certificates, "certificateImage">> & {
  certificateImage?: File | string;
};

type RowFieldErrors = Partial<Record<CertificateField, string>>;

const createEmptyCertificate = (): CertificateItem => ({
  certificateImage: undefined,
  name: "",
  number: "",
  issueDate: "",
  validTill: "",
  email: "",
  certificateHolderFirstName: "",
  certificateHolderLastName: "",
});

export const CertificatesDialog = () => {
  const formCertificates = useFormValue<CertificateItem[]>("certificates");
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();

  const [certificates, setCertificates] = useState<CertificateItem[]>(() => [
    ...(formCertificates ?? []),
    createEmptyCertificate(),
  ]);
  const [imageUrls, setImageUrls] = useState<(string | null)[]>(() => {
    const existing = (formCertificates ?? []).map((cert) =>
      typeof cert.certificateImage === "string" ? cert.certificateImage : null,
    );
    return [...existing, null];
  });
  const [rowErrors, setRowErrors] = useState<Record<number, RowFieldErrors>>(
    {},
  );
  const [formError, setFormError] = useState<string | undefined>();

  const handleAddCertificate = useCallback(() => {
    setCertificates((prev) => [...prev, createEmptyCertificate()]);
    setImageUrls((prev) => [...prev, null]);
  }, []);

  const handleRemoveCertificate = useCallback((index: number) => {
    setImageUrls((prev) => {
      const url = prev[index];
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setCertificates((prev) => prev.filter((_, i) => i !== index));
    setRowErrors({});
    setFormError(undefined);
  }, []);

  const clearFieldError = useCallback(
    (index: number, field: CertificateField) => {
      setRowErrors((prev) => {
        const row = prev[index];
        if (!row?.[field]) return prev;
        const nextRow = { ...row };
        delete nextRow[field];
        const next = { ...prev };
        if (Object.keys(nextRow).length === 0) {
          delete next[index];
        } else {
          next[index] = nextRow;
        }
        return next;
      });
      setFormError(undefined);
    },
    [],
  );

  const handleCertificateChange = useCallback(
    (index: number, field: CertificateField, value: string) => {
      setCertificates((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, [field]: value } : item,
        ),
      );
      clearFieldError(index, field);
    },
    [clearFieldError],
  );

  const handleImageChange = useCallback((index: number, file: File) => {
    const blobUrl = URL.createObjectURL(file);
    setImageUrls((prev) => {
      const oldUrl = prev[index];
      if (oldUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(oldUrl);
      }
      return prev.map((url, i) => (i === index ? blobUrl : url));
    });
    setCertificates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, certificateImage: file } : item,
      ),
    );
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => {
      const url = prev[index];
      if (url?.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
      return prev.map((u, i) => (i === index ? null : u));
    });
    setCertificates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, certificateImage: undefined } : item,
      ),
    );
  }, []);

  useEffect(() => {
    registry.register("certificates-section", {
      commit: () => {
        const kept = certificates.filter((cert) => !isBlankCertificate(cert));
        const errors = validateCertificates(kept);

        if (errors.length > 0) {
          const next: Record<number, RowFieldErrors> = {};
          const keptIndexes = certificates
            .map((cert, index) => ({ cert, index }))
            .filter(({ cert }) => !isBlankCertificate(cert))
            .map(({ index }) => index);

          errors.forEach((error) => {
            const visibleIndex = keptIndexes[error.index];
            if (visibleIndex === undefined) return;
            next[visibleIndex] = {
              ...next[visibleIndex],
              [error.field]: error.message,
            };
          });

          setRowErrors(next);
          setFormError(
            "Please complete all required certificate fields (image is optional).",
          );
          // Do not write partial certificates into the form on failed validation.
          return false;
        }

        setRowErrors({});
        setFormError(undefined);
        setValue("certificates", kept);
        return true;
      },
    });
    return () => registry.unregister("certificates-section");
  }, [registry, setValue, certificates]);

  const fieldClassName = (index: number, field: CertificateField) =>
    cn(rowErrors[index]?.[field] && "border-red-500");

  return (
    <ScrollArea className="h-[55dvh]">
      <div className="w-full flex flex-col items-start justify-start gap-4">
        {certificates.length > 0 &&
          certificates.map((cert, index) => (
            <div
              key={index}
              className="w-full p-4 border border-gray-200 rounded-xl space-y-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Certificate {index + 1}
                </h4>
                {certificates.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCertificate(index)}
                    className="text-danger hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <ImageUpload
                value={imageUrls[index] ?? null}
                onChange={(file) => {
                  if (!file) handleRemoveImage(index);
                  if (file) handleImageChange(index, file);
                }}
                onError={(error: ImageUploadError) =>
                  Toaster("Upload failed", "error", error.message)
                }
                shape="rounded"
                helperText="Optional · Recommended: 200x200px, max 2MB"
                maxSizeMB={2}
                width={250}
                height={180}
                containerClassName="px-2 "
                title="Certificate Image"
              />

              <FormGrid columns={2}>
                <div className="space-y-2">
                  <Label className="text-sm">
                    Certificate Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.name}
                    onChange={(e) =>
                      handleCertificateChange(index, "name", e.target.value)
                    }
                    placeholder="Certificate name"
                    className={fieldClassName(index, "name")}
                  />
                  <FieldError error={rowErrors[index]?.name} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Certificate Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.number}
                    onChange={(e) =>
                      handleCertificateChange(index, "number", e.target.value)
                    }
                    placeholder="Certificate number"
                    className={fieldClassName(index, "number")}
                  />
                  <FieldError error={rowErrors[index]?.number} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Issue Date <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    placeholder="Select Issue Date"
                    value={
                      cert.issueDate ? new Date(cert.issueDate) : undefined
                    }
                    onChange={(date: Date | undefined) => {
                      handleCertificateChange(
                        index,
                        "issueDate",
                        date ? date.toISOString() : "",
                      );
                    }}
                    triggerClasses={fieldClassName(index, "issueDate")}
                  />
                  <FieldError error={rowErrors[index]?.issueDate} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Valid Till <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    placeholder="Select Valid Till Date"
                    value={
                      cert.validTill ? new Date(cert.validTill) : undefined
                    }
                    onChange={(date: Date | undefined) => {
                      handleCertificateChange(
                        index,
                        "validTill",
                        date ? date.toISOString() : "",
                      );
                    }}
                    triggerClasses={fieldClassName(index, "validTill")}
                  />
                  <FieldError error={rowErrors[index]?.validTill} />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={cert.email}
                    onChange={(e) =>
                      handleCertificateChange(index, "email", e.target.value)
                    }
                    placeholder="Email address"
                    className={fieldClassName(index, "email")}
                  />
                  <FieldError error={rowErrors[index]?.email} />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Holder First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.certificateHolderFirstName}
                    onChange={(e) =>
                      handleCertificateChange(
                        index,
                        "certificateHolderFirstName",
                        e.target.value,
                      )
                    }
                    placeholder="First name"
                    className={fieldClassName(
                      index,
                      "certificateHolderFirstName",
                    )}
                  />
                  <FieldError
                    error={rowErrors[index]?.certificateHolderFirstName}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">
                    Holder Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={cert.certificateHolderLastName}
                    onChange={(e) =>
                      handleCertificateChange(
                        index,
                        "certificateHolderLastName",
                        e.target.value,
                      )
                    }
                    placeholder="Last name"
                    className={fieldClassName(
                      index,
                      "certificateHolderLastName",
                    )}
                  />
                  <FieldError
                    error={rowErrors[index]?.certificateHolderLastName}
                  />
                </div>
              </FormGrid>
            </div>
          ))}

        <FieldError error={formError} />

        <Button type="button" variant="outline" onClick={handleAddCertificate}>
          <Plus
            className="size-4.5 shrink-0 text-primary-accent self-start"
            strokeWidth={2.5}
          />
          <span className="text-600 font-semibold!">Add Certificate</span>
        </Button>
      </div>
    </ScrollArea>
  );
};
