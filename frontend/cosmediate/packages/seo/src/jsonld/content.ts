import type { JSONContentType } from "@cosmediate/type-utils";

type JsonContentNode = {
  type?: string;
  text?: string;
  content?: JsonContentNode[];
};

export function jsonContentToPlainText(
  content: JSONContentType | undefined,
): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  const node = content as JsonContentNode;

  if (node.text) {
    return node.text;
  }

  if (!node.content?.length) {
    return "";
  }

  return node.content.map(jsonContentToPlainText).join(" ").trim();
}
