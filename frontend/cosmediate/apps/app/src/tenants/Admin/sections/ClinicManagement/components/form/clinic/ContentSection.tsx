import React, { useCallback, useEffect, useRef } from "react";

import {
  useCommitRegistry,
  useFormError,
  useFormSetValue,
  useFormValue,
} from "@cosmediate/form-core";
import { JSONContentType } from "@cosmediate/type-utils/shared";
import { FieldError } from "@cosmediate/form-ui";

import HtmlEditor from "@cosmediate/ui/modules/HtmlRichText/HtmlEditor";
import { cn } from "@cosmediate/ui/lib/utils";

const MemoHtmlEditor = React.memo(HtmlEditor);

interface ContentSectionProps {
  initialContent?: JSONContentType;
}

export const ContentSection = ({ initialContent }: ContentSectionProps) => {
  const htmlAbout = useFormValue<JSONContentType | undefined>("htmlAbout");
  const contentError = useFormError("htmlAbout");
  const registry = useCommitRegistry();
  const setValue = useFormSetValue();

  const contentRef = useRef<JSONContentType | undefined>(
    initialContent ?? htmlAbout,
  );

  const handleContentChange = useCallback(
    (content: JSONContentType) => {
      contentRef.current = content;
      setValue("htmlAbout", content);
    },
    [setValue],
  );

  // Register commit handler
  useEffect(() => {
    registry.register("content-section", {
      commit: () => {
        if (contentRef.current) {
          setValue("htmlAbout", contentRef.current);
        }
      },
    });
    return () => registry.unregister("content-section");
  }, [registry, setValue]);

  return (
    <div className="w-full space-y-4">
      <div className="w-full flex items-center justify-start text-left gap-2.5 border-b pb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Detailed About of Clinic
        </h3>
      </div>

      <MemoHtmlEditor
        content={initialContent}
        setContent={handleContentChange}
        containerClass={cn(
          "max-sm:border-none max-sm:p-0",
          contentError ? "border-red-500" : ""
        )}
      />
      <FieldError error={contentError} />
    </div>
  );
};
