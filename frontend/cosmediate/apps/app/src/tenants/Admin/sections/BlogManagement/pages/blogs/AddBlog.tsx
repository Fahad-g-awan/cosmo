"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createBlogApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  BLOG_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { BlogForm } from "../../components/form/blog/BlogForm";
import { buildBlogFormData } from "../../lib/buildBlogFormData";
import { BlogFormValues } from "../../types/blog.types";

const AddBlog = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: BlogFormValues) => {
    if (!session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await createBlogApi(
        buildBlogFormData(data),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: BLOG_FORM_FIELD_MAP,
        successMessage: "Blog created successfully",
        errorTitle: "Failed to create blog",
        onSuccess: () => router.push("/blog-management"),
      });
    } catch (error) {
      console.error("Error creating blog:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to create blog",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.blogManagement.add || {
      title: "Add Blog",
      description: "Create a new blog",
    },
    "blog",
  );

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Add New Blog
        </h1>
        <p className="text-sm text-400">
          Fill in the details below to create a new blog
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
        <BlogForm
          ref={formRef}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Create Blog"
        />
      </div>
    </div>
  );
};

export default AddBlog;
