import { Extension } from "@tiptap/core";

/**
 * Keeps your current features:
 * - width/height (px/%/auto) preserved (no style loss)
 * - alignment preserved via data-alignment + style floats/margins
 * Works for both editor + HTML export + viewer HTML render.
 */
export const ImageAttributes = Extension.create({
  name: "imageAttributes",

  addGlobalAttributes() {
    return [
      {
        types: ["image"],
        attributes: {
          width: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("width") || element.style.width || null,
            renderHTML: (attributes: { width?: string | null }) =>
              attributes.width ? { width: attributes.width } : {},
          },
          height: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("height") || element.style.height || null,
            renderHTML: (attributes: { height?: string | null }) =>
              attributes.height ? { height: attributes.height } : {},
          },
          alignment: {
            default: "center",
            parseHTML: (element: HTMLElement) =>
              element.getAttribute("data-alignment") ||
              (element.style.float === "left"
                ? "left"
                : element.style.float === "right"
                  ? "right"
                  : element.style.margin === "0 auto" ||
                      element.style.display === "block"
                    ? "center"
                    : "center"),
            renderHTML: (attributes: { alignment?: string | null }) =>
              attributes.alignment
                ? { "data-alignment": attributes.alignment }
                : {},
          },
        },
      },
    ];
  },
});
