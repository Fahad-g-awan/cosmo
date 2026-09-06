"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { getBlogCategoriesApi } from "@cosmediate/api";
import type { BlogCategory } from "@cosmediate/type-utils";

interface FilterOptionsContextType {
  blogCategories: BlogCategory[];
  isLoading: boolean;
}

const FilterOptionsContext = createContext<FilterOptionsContextType | null>(
  null,
);

interface FilterOptionsProviderProps {
  children: React.ReactNode;
}

export const FilterOptionsProvider = ({
  children,
}: FilterOptionsProviderProps) => {
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    void (async () => {
      try {
        const [blogResult] = await Promise.allSettled([
          getBlogCategoriesApi({ pagination: { limit: 100 } }),
        ]);

        if (blogResult.status === "fulfilled") {
          const blogRes = blogResult.value;
          if (blogRes.success && blogRes.items) {
            setBlogCategories(blogRes.items);
          }
        } else {
          console.error(
            "[FilterOptionsProvider] Failed to fetch blog categories:",
            blogResult.reason,
          );
        }
      } catch (error) {
        console.error("[FilterOptionsProvider] Failed to load filter data:", error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    })();
  }, []);

  const value: FilterOptionsContextType = useMemo(
    () => ({
      blogCategories,
      isLoading,
    }),
    [blogCategories, isLoading],
  );

  return (
    <FilterOptionsContext.Provider value={value}>
      {children}
    </FilterOptionsContext.Provider>
  );
};

export const useFilterOptions = (): FilterOptionsContextType => {
  const context = useContext(FilterOptionsContext);
  if (!context) {
    throw new Error(
      "useFilterOptions must be used within FilterOptionsProvider",
    );
  }
  return context;
};
