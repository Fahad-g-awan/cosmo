import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";

import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui/";

import { CloudUpload, Trash2 } from "lucide-react";
import { IconType } from "react-icons";

interface SingleProps {
  placeholderSrc?: string;
  alt?: string;
  className?: string;
  buttonText?: string;
  onChange?: (file: File | null) => void;
  existingUrl?: string;
  Icon?: IconType;
}

interface DragDropProps {
  placeholderSrc?: string;
  alt?: string;
  className?: string;
  onChange?: (file: File | null) => void;
  urlSrc?: string;
}

interface MultipleProps {
  placeholderSrc?: string;
  alt?: string;
  className?: string;
  maxCount?: number;
  onChange?: (files: File[]) => void;
}

const ImageUploadSingle = ({
  placeholderSrc = "/default/placeholder.webp",
  alt = "Preview",
  className = "",
  buttonText = "Upload Image",
  onChange,
  existingUrl = "",
  Icon,
}: SingleProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
      onChange?.(e.target.files[0]);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="rounded-full overflow-hidden bg-gray-100 flex items-center justify-center aspect-square w-20 h-20">
        {preview ? (
          <Image
            src={preview}
            alt={alt}
            height={100}
            width={100}
            className={cn("w-full h-full")}
            onLoad={() => URL.revokeObjectURL(preview)}
          />
        ) : (
          <Image
            src={existingUrl || placeholderSrc}
            alt="Placeholder"
            height={100}
            width={100}
            className={cn("w-full h-full")}
          />
        )}
      </div>

      <div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleChange}
        />
        <Button
          type="button"
          variant={"outline"}
          className="!border-2 py-2"
          onClick={() => inputRef.current?.click()}
        >
          {Icon && <Icon className="text-primary-accent size-5" />}
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const ImageUploadDragDrop = ({
  alt = "Preview",
  className = "",
  onChange,
  urlSrc = "",
}: DragDropProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPreview(URL.createObjectURL(e.target.files[0]));
      onChange?.(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPreview(URL.createObjectURL(e.dataTransfer.files[0]));
      onChange?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-white flex items-start justify-center border rounded-xl transition-colors cursor-pointer overflow-hidden ${dragActive ? "border-blue-400 bg-primary-accent/70" : "border-stroke"} ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
      />
      {preview || urlSrc ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <Image
            src={preview || urlSrc}
            alt={alt}
            fill
            onLoad={() => URL.revokeObjectURL(preview ?? "")}
            className={cn(
              "object-cover w-full h-full"
              // leftImage && "rounded-l-lg",
              // rightImage && "rounded-r-lg"
            )}
          />
          <Button
            type="button"
            className="absolute top-2 right-2 rounded-lg p-2 bg-white hover:bg-white group shadow"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onChange?.(null);
            }}
          >
            <Trash2
              strokeWidth={3}
              className="size-4 text-danger/80 group-hover:text-danger"
            />
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl flex flex-col items-center justify-center gap-3 text-center w-full h-full py-8">
          <CloudUpload className="text-primary-accent size-6" />
          <span className="text-medium leading-[21px] text-700 text-[12px]">
            Drop photos here <br />
            or
            <span className="text-primary-accent underline ml-1">
              click to Upload
            </span>
          </span>
          <span className="text-400 text-[10px] font-semibold leading-[17px]">
            Supports JPEG, PNG upto 10mb
          </span>
        </div>
      )}
    </div>
  );
};

const ImageUploadMultiple = ({
  placeholderSrc = "/default/placeholder.webp",
  alt = "Preview",
  className = "",
  maxCount = 10,
  onChange,
}: MultipleProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPreviews = Array.from(e.target.files)
        .slice(0, maxCount - previews.length)
        .map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      onChange?.([
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...previews.map((_) => {
          const file = new File([new Blob()], "image.jpg", {
            type: "image/jpeg",
          });
          return file;
        }),
        ...Array.from(e.target.files).slice(0, maxCount - previews.length),
      ]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newPreviews = Array.from(e.dataTransfer.files)
        .slice(0, maxCount - previews.length)
        .map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      onChange?.([
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...previews.map((_) => {
          const file = new File([new Blob()], "image.jpg", {
            type: "image/jpeg",
          });
          return file;
        }),
        ...Array.from(e.dataTransfer.files).slice(
          0,
          maxCount - previews.length
        ),
      ]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="relative w-full min-h-[120px] border-2 border-dashed rounded-lg bg-gray-50 flex flex-wrap gap-4 p-4"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{ cursor: "pointer" }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          multiple
          onChange={handleChange}
        />
        {previews.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full h-24">
            <Image
              src={placeholderSrc}
              alt="Placeholder"
              width={48}
              height={48}
              className="opacity-50 mb-2"
            />
            <span className="text-gray-400">
              Drag & Drop or Click to Upload
            </span>
          </div>
        )}
        <div className="flex flex-wrap gap-4">
          {previews.map((src, idx) => (
            <div
              key={idx}
              className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
            >
              <Image
                src={src}
                alt={alt}
                fill
                style={{ objectFit: "cover" }}
                onLoad={() => URL.revokeObjectURL(src)}
              />
              <Button
                type="button"
                className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviews(previews.filter((_, i) => i !== idx));
                  onChange?.(
                    previews
                      .filter((_, i) => i !== idx)
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      .map((_) => {
                        const file = new File([new Blob()], "image.jpg", {
                          type: "image/jpeg",
                        });
                        return file;
                      })
                  );
                }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20">
                  <path
                    d="M6 6l8 8M6 14L14 6"
                    stroke="#f00"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ImageUploadSingle, ImageUploadDragDrop, ImageUploadMultiple };

// Usage Example (not included in file):
// const { images } = useImageUpload();
// <ImageUpload multiple onChange={setImages}>
//   <ImageUpload.Multiple />
// </ImageUpload>
