"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  deleteBlogCategoryApi,
  getManagementBlogCategoryApi,
} from "@cosmediate/api";
import { BlogCategory } from "@cosmediate/type-utils";
import { Toaster, CategoryLoader, NoDataFound } from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useAuth } from "@cosmediate/auth";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { CategoryDetailSection } from "../../components/detailPage/blogCategory/CategoryDetailSection";
import { SystemInfoSection } from "../../components/detailPage/blogCategory/SystemInfoSection";
import { HeaderSection } from "../../components/detailPage/blogCategory/HeaderSection";

import { RiBloggerLine } from "react-icons/ri";

const CategoryDetails = () => {
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const categoryId = params.id;

  const handleFetchBlogCategory = useCallback(async () => {
    if (!categoryId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementBlogCategoryApi(
        { id: categoryId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setCategory(response.item);
      } else {
        showApiFailureToast(response, "Failed to load blog category");
      }
    } catch (error) {
      console.error("Error fetching blog category:", error);
      Toaster("An error occurred while loading blog category data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, session?.tokens?.accessToken]);

  const handleDelete = useCallback(() => {
    if (!categoryId) {
      console.log("[Blogs_Categories_HandleDelete] Error blog id not provided");
      Toaster(
        "Something went wrong",
        "error",
        "Please try again or contact support",
      );
      return;
    }

    openDialog({
      dialogType: "delete",
      payload: {
        onConfirm: async () => {
          try {
            const resp = await deleteBlogCategoryApi(
              { id: categoryId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Blog category deleted successfully",
              errorTitle: "Failed to delete blog category",
              closeDialog,
              onSuccess: () => router.push("/blog-management/categories"),
            });
          } catch (error) {
            console.log(
              "[Blogs_Categories_HandleDelete] Error deleting blog category:",
              error,
            );
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Blog category deleted successfully",
                errorTitle: "Failed to delete blog category",
                closeDialog,
                onSuccess: () => router.push("/blog-management/categories"),
              },
            );
          }
        },
      },
    });
  }, [
    closeDialog,
    openDialog,
    session?.tokens?.accessToken,
    router,
    categoryId,
  ]);

  useGatedPanelHeader(
    panelHeaderConfig.admin.blogManagement.categories.record,
    "blog_category",
  );

  useEffect(() => {
    handleFetchBlogCategory();
  }, [handleFetchBlogCategory]);

  if (isLoading && !category) {
    return <CategoryLoader />;
  }

  if (!category && !isLoading) {
    return (
      <NoDataFound
        message="Blog category data not found"
        description="Please try again or contact support"
        icon={<RiBloggerLine className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {category && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            blogCategory={category}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-10 sm:p-6">
            <CategoryDetailSection blogCategory={category} />
            <SystemInfoSection blogCategory={category} />
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default CategoryDetails;
