import { Extension } from "@tiptap/core";

interface LineHeightOptions {
  types: string[];
  lineHeights: string[];
  defaultLineHeight: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: "lineHeight",

  addOptions() {
    return {
      types: ["paragraph", "heading"],
      lineHeights: ["1", "1.15", "1.5", "2", "2.5", "3"],
      defaultLineHeight: "1.5",
    };
  },

  addGlobalAttributes() {
    const types = Array.isArray(this.options?.types)
      ? this.options.types
      : ["paragraph", "heading"];

    return [
      {
        types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement): string | null =>
              element.style.lineHeight ||
              element.getAttribute("data-line-height") ||
              null,
            renderHTML: (attributes: { lineHeight?: string | null }) => {
              if (!attributes.lineHeight) return {};
              return {
                style: `line-height: ${attributes.lineHeight}`,
                "data-line-height": attributes.lineHeight,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ chain }) => {
          const types = Array.isArray(this.options?.types)
            ? this.options.types
            : ["paragraph", "heading"];

          let ch = chain();
          for (const type of types)
            ch = ch.updateAttributes(type, { lineHeight });
          return ch.run();
        },

      unsetLineHeight:
        () =>
        ({ chain }) => {
          const types = Array.isArray(this.options?.types)
            ? this.options.types
            : ["paragraph", "heading"];

          let ch = chain();
          for (const type of types) ch = ch.resetAttributes(type, "lineHeight");
          return ch.run();
        },
    };
  },
});
