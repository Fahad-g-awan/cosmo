import React from "react";

import { tiptapJsonToHtml } from "@cosmediate/ui/modules/HtmlRichText/utils/tiptapToHtml";
import HtmlViewer from "@cosmediate/ui/modules/HtmlRichText/HtmlViewer";
import { InfoMessage } from "@cosmediate/ui/index";
import { Treatment } from "@cosmediate/type-utils";

import { FileText } from "lucide-react";

export const ContentSection = ({ treatment }: { treatment: Treatment }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-2">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <FileText className="h-5 w-5" />
        Content
      </div>

      <div className="w-full flex flex-col items-center justify-start">
        {treatment?.htmlDescription ? (
          <HtmlViewer
            html={tiptapJsonToHtml(treatment.htmlDescription)}
            className="prose prose-sm max-w-none"
          />
        ) : (
          <InfoMessage
            message="Content not available"
            variant="info"
            size="sm"
            className="my-5"
          />
        )}
      </div>
    </div>
  );
};
