import React, { useCallback, useEffect, useRef } from "react";

import {
  useCommitRegistry,
  useFormError,
  useFormSetValue,
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
  const contentError = useFormError("content");
  const setValue = useFormSetValue();
  const registry = useCommitRegistry();

  const contentRef = useRef<JSONContentType | undefined>(initialContent);

  const handleContentChange = useCallback(
    (content: JSONContentType) => {
      contentRef.current = content;
      setValue("content", content);
    },
    [setValue],
  );

  // Register commit handler
  useEffect(() => {
    registry.register("content-section", {
      commit: () => {
        if (contentRef.current) {
          setValue("content", contentRef.current);
        }
      },
    });
    return () => registry.unregister("content-section");
  }, [registry, setValue]);

  return (
    <div className="w-full space-y-4">
      <div className="w-full flex items-center justify-start text-left gap-2.5">
        <h3 className="text-sm font-semibold text-gray-700">Content</h3>
        <h3 className="text-red-400">*</h3>
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
