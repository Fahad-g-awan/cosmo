"use client";

import * as React from "react";
import Image from "next/image";
import { X, ImagePlus } from "lucide-react";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui/components/button";

type UploadErrorCode = "FILE_TOO_LARGE" | "INVALID_TYPE" | "MAX_FILES";
export type MultiImageUploadError = { code: UploadErrorCode; message: string };

type Shape = "circle" | "rounded" | "square";

export interface MultiImageUploadProps {
  /** Already uploaded images (S3 URLs etc.) */
  value?: string[]; // default []

  /**
   * New files selected in this session (parent keeps these for upload).
   * If you don't want controlled files, you can omit and just use onFilesChange.
   */
  files?: File[]; // optional controlled
  defaultFiles?: File[]; // optional uncontrolled

  /** Called when new files list changes (selected files only, not URLs) */
  onFilesChange?: (files: File[]) => void;

  /**
   * Called when URLs change (removing an existing URL from gallery).
   * If you want to persist removal server-side, do it in parent using this callback.
   */
  onValueChange?: (urls: string[]) => void;

  /** Optional unified callback if you want one place to handle everything */
  onChange?: (payload: { urls: string[]; files: File[] }) => void;

  onError?: (error: MultiImageUploadError) => void;

  accept?: string; // default image/*
  disabled?: boolean;

  /** Defaults */
  maxSizeMB?: number; // default 5
  maxFiles?: number; // total (urls + files + new selection) default 10

  /** UI */
  title?: React.ReactNode;
  helperText?: React.ReactNode;
  addText?: React.ReactNode;

  /** Grid + item presentation */
  columns?: number; // default 2
  aspectClassName?: string; // default "aspect-video"
  itemShape?: Shape; // default "rounded"

  /** Styling overrides */
  rootClassName?: string;
  containerClassName?: string;
  gridClassName?: string;
  itemClassName?: string;
  removeButtonClassName?: string;
  addButtonClassName?: string;
}

type PreviewItem =
  | { kind: "url"; id: string; src: string }
  | { kind: "file"; id: string; src: string; file: File };

function itemShapeClasses(shape: Shape) {
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-none";
  return "rounded-lg";
}

export function MultiImageUpload({
  value = [],

  files,
  defaultFiles = [],
  onFilesChange,

  onValueChange,
  onChange,

  onError,

  accept = "image/*",
  disabled = false,

  maxSizeMB = 5,
  maxFiles = 10,

  title = "Images",
  helperText = "You can upload multiple images",
  addText = "Add Images",

  columns = 2,
  aspectClassName = "aspect-video",
  itemShape = "rounded",

  rootClassName,
  containerClassName,
  gridClassName,
  itemClassName,
  removeButtonClassName,
  addButtonClassName,
}: MultiImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isFilesControlled = files !== undefined;
  const [internalFiles, setInternalFiles] =
    React.useState<File[]>(defaultFiles);

  const selectedFiles = isFilesControlled ? files! : internalFiles;

  // Map file -> blob url (and revoke)
  const [filePreviews, setFilePreviews] = React.useState<
    { id: string; file: File; url: string }[]
  >([]);

  // Build/update previews whenever selectedFiles changes
  React.useEffect(() => {
    // Revoke previews that are no longer present
    setFilePreviews((prev) => {
      const next: typeof prev = [];
      const still = new Set(selectedFiles);

      for (const p of prev) {
        if (still.has(p.file)) next.push(p);
        else URL.revokeObjectURL(p.url);
      }

      // Add previews for new files without preview
      const existingFiles = new Set(next.map((p) => p.file));
      for (const f of selectedFiles) {
        if (!existingFiles.has(f)) {
          next.push({
            id: crypto.randomUUID(),
            file: f,
            url: URL.createObjectURL(f),
          });
        }
      }

      return next;
    });
  }, [selectedFiles]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      for (const p of filePreviews) URL.revokeObjectURL(p.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = React.useCallback(
    (nextUrls: string[], nextFiles: File[]) => {
      onValueChange?.(nextUrls);
      onFilesChange?.(nextFiles);
      onChange?.({ urls: nextUrls, files: nextFiles });

      if (!isFilesControlled) setInternalFiles(nextFiles);
    },
    [onValueChange, onFilesChange, onChange, isFilesControlled]
  );

  const openDialog = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const validateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError?.({
        code: "INVALID_TYPE",
        message: "Please select only image files.",
      });
      return false;
    }

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      onError?.({
        code: "FILE_TOO_LARGE",
        message: `An image is too large. Max allowed is ${maxSizeMB}MB.`,
      });
      return false;
    }

    return true;
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (incoming.length === 0) return;

    const currentCount = value.length + selectedFiles.length;
    if (currentCount >= maxFiles) {
      onError?.({
        code: "MAX_FILES",
        message: `You can upload up to ${maxFiles} images.`,
      });
      return;
    }

    const valid = incoming.filter(validateFile);
    if (valid.length === 0) return;

    const room = Math.max(0, maxFiles - currentCount);
    const toAdd = valid.slice(0, room);

    if (toAdd.length < valid.length) {
      onError?.({
        code: "MAX_FILES",
        message: `Only ${room} more image(s) allowed (max ${maxFiles}).`,
      });
    }

    commit(value, [...selectedFiles, ...toAdd]);
  };

  const removeUrlAt = (index: number) => {
    const next = value.filter((_, i) => i !== index);
    commit(next, selectedFiles);
  };

  const removeFileById = (id: string) => {
    const preview = filePreviews.find((p) => p.id === id);
    if (!preview) return;

    const nextFiles = selectedFiles.filter((f) => f !== preview.file);

    // revoke immediately for snappy cleanup
    URL.revokeObjectURL(preview.url);
    setFilePreviews((prev) => prev.filter((p) => p.id !== id));

    commit(value, nextFiles);
  };

  const items: PreviewItem[] = [
    ...value.map((src): PreviewItem => ({ kind: "url", id: src, src })),
    ...filePreviews.map(
      (p): PreviewItem => ({ kind: "file", id: p.id, src: p.url, file: p.file })
    ),
  ];

  return (
    <div className={cn("space-y-2", rootClassName)}>
      {title ? (
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4 p-6 border border-gray-200 rounded-lg bg-gray-50/50",
          containerClassName
        )}
      >
        {items.length > 0 && (
          <div
            className={cn("grid gap-3", gridClassName)}
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "relative overflow-hidden bg-white border border-gray-200",
                  aspectClassName,
                  itemShapeClasses(itemShape),
                  itemClassName
                )}
              >
                <Image
                  fill
                  src={item.src}
                  alt={`image ${index + 1}`}
                  className="object-cover"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (item.kind === "url") removeUrlAt(index);
                    else removeFileById(item.id);
                  }}
                  className={cn(
                    "absolute p-1 rounded-full transition-colors",
                    "bg-danger text-white hover:bg-red-600 disabled:opacity-50",
                    itemShape === "circle" ? "top-5 right-5" : "top-1 right-1",
                    removeButtonClassName
                  )}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add button */}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={openDialog}
          className={cn(
            "w-full gap-2 py-6 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-100",
            addButtonClassName
          )}
        >
          <ImagePlus className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">{addText}</span>
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleAddFiles}
          className="hidden"
          disabled={disabled}
        />

        {helperText ? (
          <p className="text-xs text-gray-500 text-center">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
