"use client";

import type { JSONContent } from "@tiptap/react";
import { useState } from "react";

// import { tiptapJsonToHtml } from "../utils/tiptapToHtml";
import HtmlEditor from "../HtmlEditor";
import HtmlViewer from "../HtmlViewer";

export default function BlogEditorPage() {
  const [contentJson, setContentJson] = useState<JSONContent | undefined>({
    type: "doc",
    content: [],
  });

  const [contentHtml, setContentHtml] = useState<string>("");

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* EDITOR */}
      <div>
        <h2 className="mb-2 font-semibold">Editor</h2>

        <HtmlEditor
          content={contentJson}
          setContent={setContentJson}
          setHtmlCache={setContentHtml}
        />
      </div>

      {/* VIEWER */}
      <div>
        <h2 className="mb-2 font-semibold">Preview</h2>

        <HtmlViewer html={contentHtml} />
      </div>
    </div>
  );
}
