"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, CategoryLoader, Toaster } from "@cosmediate/ui";
import {
  getManagementBlogCategoryApi,
  updateBlogCategoryApi,
} from "@cosmediate/api";
import { BlogCategory } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  BLOG_CATEGORY_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { CategoryForm } from "../../components/form/blogCategory/CategoryForm";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { CategoryFormValues } from "../../types/blogCategory.types";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { RiBloggerLine } from "react-icons/ri";

const UpdateBlogCategory = () => {
  const [blogCategory, setBlogCategory] = useState<BlogCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const categoryId = searchParams.id;

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
        setBlogCategory(response.item);
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

  const handleSubmit = async (data: CategoryFormValues) => {
    if (!categoryId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateBlogCategoryApi(
        {
          id: categoryId,
          name: data.names[0] ?? "",
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: BLOG_CATEGORY_FIELD_MAP,
        successMessage: "Blog category updated successfully",
        errorTitle: "Failed to update blog category",
        onSuccess: () => router.push("/blog-management/categories"),
      });
    } catch (error) {
      console.error("Error updating blog category:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update blog category",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.blogManagement.categories.update || {
      title: "Update Blog Category",
      description: "Edit blog category details",
    },
    "blog_category",
  );

  useEffect(() => {
    handleFetchBlogCategory();
  }, [handleFetchBlogCategory, categoryId]);

  if (isLoading && !blogCategory) {
    return <CategoryLoader />;
  }

  if (!blogCategory && !isLoading) {
    return (
      <NoDataFound
        message="Blog category data not found"
        description="Please try again or contact support"
        icon={<RiBloggerLine className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Blog Category
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {blogCategory?.name}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {blogCategory && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <CategoryForm
            ref={formRef}
            initialData={blogCategory}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Category"
            mode="single"
          />
        </div>
      )}
    </div>
  );
};

export default UpdateBlogCategory;
