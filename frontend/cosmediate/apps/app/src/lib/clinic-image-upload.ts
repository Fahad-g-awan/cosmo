import { useMemo, useRef } from "react";

import type { ImageItem } from "@cosmediate/ui";

export function useClinicImageItems(
  stored: (string | File)[] | undefined | null,
): ImageItem[] {
  const blobUrlByFileRef = useRef(new WeakMap<File, string>());

  return useMemo(() => {
    if (!stored?.length) return [];

    return stored.map((item, index) => {
      if (typeof item === "string") {
        return { id: `url-${index}`, url: item };
      }

      let url = blobUrlByFileRef.current.get(item);
      if (!url) {
        url = URL.createObjectURL(item);
        blobUrlByFileRef.current.set(item, url);
      }

      return {
        id: `file-${index}-${item.name}`,
        url,
        file: item,
      };
    });
  }, [stored]);
}
