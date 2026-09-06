"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createBlogCategoryApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  BLOG_CATEGORY_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { CategoryForm } from "../../components/form/blogCategory/CategoryForm";
import { CategoryFormValues } from "../../types/blogCategory.types";

const AddBlogCategory = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: CategoryFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createBlogCategoryApi(
        {
          categories: data.names,
          published: data.published,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: BLOG_CATEGORY_FIELD_MAP,
        successMessage: "Blog categories created successfully",
        errorTitle: "Failed to create blog categories",
        onSuccess: () => router.push("/blog-management/categories"),
      });
    } catch (error) {
      console.error("Error creating blog categories:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create blog categories",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.blogManagement.categories.add || {
      title: "Add Blog Categories",
      description: "Create a new blog categories",
    },
    "blog_category",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Blog Categories
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create new blog categories
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <CategoryForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Categories"
          mode="multiple"
        />
      </div>
    </div>
  );
};

export default AddBlogCategory;
