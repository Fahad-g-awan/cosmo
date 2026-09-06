"use client";

import { usePathname } from "next/navigation";
import { restrictedPaths } from "../lib/config";

const useFooter = () => {
  const urlPath = usePathname();
  let showFooter = true;

  if (restrictedPaths.some((path) => urlPath.startsWith(path))) {
    showFooter = false;
  }

  return { showFooter };
};

export default useFooter;
