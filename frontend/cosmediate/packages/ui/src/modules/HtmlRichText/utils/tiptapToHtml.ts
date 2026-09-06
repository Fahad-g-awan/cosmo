import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Underline } from "@tiptap/extension-underline";

import { LineHeight } from "../extensions/lineHeight";
import { FontSize } from "../extensions/fontSize";
import { ImageAttributes } from "../extensions/imageAttributes";

import type { JSONContent } from "@tiptap/react";

export function tiptapJsonToHtml(json: JSONContent): string {
  if (!json) return "";

  return generateHTML(json, [
    StarterKit,
    Image,
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link,
    TextStyle,
    Color,
    FontFamily,
    Underline,
    FontSize,
    LineHeight,
    ImageAttributes,
  ]);
}
