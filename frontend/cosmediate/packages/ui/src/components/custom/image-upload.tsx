"use client";

import * as React from "react";
import Image from "next/image";
import { X, Upload, Plus } from "lucide-react";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui/components/button";

type Shape = "circle" | "rounded" | "square";

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");

function isAllowedImageMimeType(type: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.includes(
    type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
  );
}

function invalidImageTypeMessage(): string {
  return `Please select a supported image type (${ALLOWED_IMAGE_MIME_TYPES.join(", ")})`;
}

type UploadErrorCode = "FILE_TOO_LARGE" | "INVALID_TYPE" | "MAX_FILES_EXCEEDED";
export type ImageUploadError = { code: UploadErrorCode; message: string };

// ---------- Single Image Upload Props ----------
export interface SingleImageUploadProps {
  multiple?: false;
  /** Already uploaded URL (S3, CDN, etc.) OR null */
  value: string | null;
  /** Fired when user picks a new file; null means cleared */
  onChange: (file: File | null) => void;
}

// ---------- Multiple Image Upload Props ----------
export interface ImageItem {
  /** Unique identifier for this image (could be URL or generated id) */
  id: string;
  /** The URL to display (S3/CDN URL or blob URL) */
  url: string;
  /** The File object if this is a new upload, undefined if existing */
  file?: File;
}

export interface MultipleImageUploadProps {
  multiple: true;
  /** Array of existing images */
  value: ImageItem[];
  /** Fired when images change (add/remove) */
  onChange: (images: ImageItem[]) => void;
  /** Maximum number of images allowed */
  maxFiles?: number;
}

// ---------- Common Props ----------
interface CommonImageUploadProps {
  /** Optional error handler so parent can toast */
  onError?: (error: ImageUploadError) => void;

  accept?: string; // default: image/*
  disabled?: boolean;

  /** Default: 3MB */
  maxSizeMB?: number;

  shape?: Shape;
  width?: number;
  height?: number;

  title?: React.ReactNode;
  helperText?: React.ReactNode;
  uploadText?: React.ReactNode;

  placeholder?: React.ReactNode;
  placeholderImageSrc?: string;

  rootClassName?: string;
  containerClassName?: string;
  previewWrapperClassName?: string;
  imageClassName?: string;
  removeButtonClassName?: string;
  uploadButtonClassName?: string;

  /** Grid columns for multiple mode (default: 4) */
  gridCols?: number;
}

export type ImageUploadProps = CommonImageUploadProps &
  (SingleImageUploadProps | MultipleImageUploadProps);

function shapeClasses(shape: Shape) {
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-none";
  return "rounded-xl";
}

function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ---------- Single Image Upload Component ----------
function SingleImageUpload({
  value,
  onChange,
  onError,
  accept = ALLOWED_IMAGE_ACCEPT,
  disabled = false,
  maxSizeMB = 3,
  shape = "circle",
  width = 128,
  height = 128,
  title = "Image",
  helperText = "Recommended: at least 200×200px",
  uploadText = "Upload Image",
  placeholder,
  placeholderImageSrc,
  rootClassName,
  containerClassName,
  previewWrapperClassName,
  imageClassName,
  removeButtonClassName,
  uploadButtonClassName,
}: CommonImageUploadProps & SingleImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);
  const displayUrl = localPreview ?? value;

  const revokeLocalPreview = React.useCallback(() => {
    setLocalPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFileDialog = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const clear = React.useCallback(() => {
    if (disabled) return;
    if (inputRef.current) inputRef.current.value = "";
    revokeLocalPreview();
    onChange(null);
  }, [disabled, onChange, revokeLocalPreview]);

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      if (!isAllowedImageMimeType(file.type)) {
        e.target.value = "";
        onError?.({
          code: "INVALID_TYPE",
          message: invalidImageTypeMessage(),
        });
        return;
      }

      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        e.target.value = "";
        onError?.({
          code: "FILE_TOO_LARGE",
          message: `Image is too large. Max allowed is ${maxSizeMB}MB.`,
        });
        return;
      }

      revokeLocalPreview();
      const blobUrl = URL.createObjectURL(file);
      setLocalPreview(blobUrl);
      onChange(file);
    },
    [maxSizeMB, onChange, onError, revokeLocalPreview]
  );

  const defaultPlaceholder = (
    <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
      <Upload className="w-6 h-6" />
      <span className="text-xs">No image</span>
    </div>
  );

  return (
    <div className={cn("space-y-4", rootClassName)}>
      {title ? (
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      ) : null}

      <div
        className={cn(
          "flex flex-col items-center gap-4 p-6 border border-gray-200 bg-gray-50/50 rounded-lg",
          containerClassName
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden bg-white flex items-center justify-center",
            "border-2 border-dashed border-gray-300",
            shapeClasses(shape),
            previewWrapperClassName
          )}
          style={{ width, height }}
        >
          {displayUrl ? (
            <>
              <Image
                width={width}
                height={height}
                src={displayUrl}
                alt="Preview"
                className={cn("w-full h-full object-cover", imageClassName)}
              />
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  clear();
                }}
                disabled={disabled}
                className={cn(
                  "absolute p-1 rounded-full transition-colors",
                  "bg-danger text-white hover:bg-red-500 disabled:opacity-50",
                  shape === "circle" ? "top-5 right-5" : "top-1 right-1",
                  removeButtonClassName
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : placeholderImageSrc ? (
            <Image
              width={width}
              height={height}
              src={placeholderImageSrc}
              alt="Placeholder"
              className={cn("w-full h-full object-cover", imageClassName)}
            />
          ) : placeholder ? (
            placeholder
          ) : (
            defaultPlaceholder
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={openFileDialog}
          className={cn("gap-2", uploadButtonClassName)}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">{uploadText}</span>
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
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

// ---------- Multiple Image Upload Component ----------
function MultipleImageUpload({
  value,
  onChange,
  onError,
  accept = ALLOWED_IMAGE_ACCEPT,
  disabled = false,
  maxSizeMB = 3,
  maxFiles = 10,
  shape = "rounded",
  width = 120,
  height = 120,
  title = "Images",
  helperText,
  uploadText = "Add Images",
  placeholder,
  rootClassName,
  containerClassName,
  previewWrapperClassName,
  imageClassName,
  removeButtonClassName,
  uploadButtonClassName,
  gridCols = 4,
}: CommonImageUploadProps & MultipleImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Track blob URLs we create so we can revoke them
  const blobUrlsRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    // Capture ref value for cleanup
    const blobUrls = blobUrlsRef.current;
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
      blobUrls.clear();
    };
  }, []);

  const openFileDialog = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const removeImage = React.useCallback(
    (id: string) => {
      if (disabled) return;

      const imageToRemove = value.find((img) => img.id === id);
      if (imageToRemove && imageToRemove.url.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
        blobUrlsRef.current.delete(imageToRemove.url);
      }

      onChange(value.filter((img) => img.id !== id));
    },
    [disabled, onChange, value]
  );

  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      // Reset input
      e.target.value = "";

      // Check max files limit
      const remainingSlots = maxFiles - value.length;
      if (remainingSlots <= 0) {
        onError?.({
          code: "MAX_FILES_EXCEEDED",
          message: `Maximum ${maxFiles} images allowed.`,
        });
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        onError?.({
          code: "MAX_FILES_EXCEEDED",
          message: `Only ${remainingSlots} more image(s) can be added. Maximum is ${maxFiles}.`,
        });
      }

      const newImages: ImageItem[] = [];
      const errors: string[] = [];

      for (const file of filesToProcess) {
        // Validate type
        if (!isAllowedImageMimeType(file.type)) {
          errors.push(`${file.name}: ${invalidImageTypeMessage()}`);
          continue;
        }

        // Validate size
        if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name}: Exceeds ${maxSizeMB}MB limit`);
          continue;
        }

        const blobUrl = URL.createObjectURL(file);
        blobUrlsRef.current.add(blobUrl);

        newImages.push({
          id: generateId(),
          url: blobUrl,
          file,
        });
      }

      if (errors.length > 0) {
        onError?.({
          code: "INVALID_TYPE",
          message: errors.join("; "),
        });
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }
    },
    [maxFiles, maxSizeMB, onChange, onError, value]
  );

  const defaultPlaceholder = (
    <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
      <Upload className="w-6 h-6" />
      <span className="text-xs">No images</span>
    </div>
  );

  const canAddMore = value.length < maxFiles;
  const defaultHelperText = `Upload up to ${maxFiles} images (max ${maxSizeMB}MB each)`;

  return (
    <div className={cn("space-y-4", rootClassName)}>
      {title ? (
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      ) : null}

      <div
        className={cn(
          "flex flex-col gap-4 p-6 border border-gray-200 bg-gray-50/50 rounded-lg",
          containerClassName
        )}
      >
        {/* Image Grid */}
        {value.length > 0 ? (
          <div
            // className="grid gap-3 place-items-center"
            className="w-full flex items-center justify-start gap-3 flex-wrap"
            // style={{
            //   gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            // }}
          >
            {value.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  "relative overflow-hidden bg-white flex items-center justify-center",
                  "border-2 border-gray-200 group",
                  shapeClasses(shape),
                  previewWrapperClassName
                )}
                style={{ width, height }}
              >
                <Image
                  width={width}
                  height={height}
                  src={image.url}
                  alt={`Image ${index + 1}`}
                  className={cn("w-full h-full object-cover", imageClassName)}
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    removeImage(image.id);
                  }}
                  disabled={disabled}
                  className={cn(
                    "absolute top-1 right-1 p-1 cursor-pointer rounded-full transition-all",
                    "bg-danger text-white hover:bg-red-500 disabled:opacity-50",
                    removeButtonClassName
                  )}
                >
                  <X className="size-3" />
                </button>

                {/* Image index badge */}
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </span>
              </div>
            ))}

            {/* Add more button (inline in grid) */}
            {canAddMore && (
              <button
                type="button"
                disabled={disabled}
                onClick={openFileDialog}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "border-2 border-dashed border-gray-300 bg-white",
                  "text-gray-400 hover:text-gray-600 hover:border-gray-400",
                  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  shapeClasses(shape)
                )}
                style={{ width, height }}
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add</span>
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex items-center justify-center",
                "border-2 border-dashed border-gray-300 bg-white",
                shapeClasses(shape)
              )}
              style={{ width: width * 1.5, height: height * 1.5 }}
            >
              {placeholder ?? defaultPlaceholder}
            </div>
          </div>
        )}

        {/* Upload button (shown when empty or as alternative) */}
        {(value.length === 0 || canAddMore) && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={disabled || !canAddMore}
              onClick={openFileDialog}
              className={cn("gap-2 !text-xs", uploadButtonClassName)}
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">{uploadText}</span>
              {value.length > 0 && (
                <span className="text-xs text-gray-400">
                  ({value.length}/{maxFiles})
                </span>
              )}
            </Button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {(helperText ?? defaultHelperText) ? (
          <p className="text-xs text-gray-500 text-center">
            {helperText ?? defaultHelperText}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ---------- Main Export (Union Component) ----------
export function ImageUpload(props: ImageUploadProps) {
  if (props.multiple === true) {
    return <MultipleImageUpload {...props} />;
  }
  return <SingleImageUpload {...props} />;
}
