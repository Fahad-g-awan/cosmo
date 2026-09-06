import type { JSONContentType } from "@cosmediate/type-utils/shared";

const hasRichTextContent = (nodes: JSONContentType[] | undefined): boolean => {
  if (!nodes?.length) return false;

  for (const node of nodes) {
    if (typeof node.text === "string" && node.text.trim()) return true;
    if (hasRichTextContent(node.content)) return true;
  }

  return false;
};

export const isRichTextFilled = (content: JSONContentType | undefined): boolean =>
  Boolean(content?.content?.length && hasRichTextContent(content.content));
