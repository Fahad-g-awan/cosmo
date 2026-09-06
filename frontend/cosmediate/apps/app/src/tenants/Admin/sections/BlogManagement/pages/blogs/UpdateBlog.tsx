"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

import { NoDataFound, BlogsFormLoader, Toaster } from "@cosmediate/ui";
import { getManagementBlogApi, updateBlogApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  BLOG_FORM_FIELD_MAP,
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import type { FormApiRef } from "@app/lib/form-api-ref";

import { Blog } from "@cosmediate/type-utils/blog";
import { BlogForm } from "../../components/form/blog/BlogForm";
import { buildBlogFormData } from "../../lib/buildBlogFormData";
import { BlogFormValues } from "../../types/blog.types";
import { RiBloggerLine } from "react-icons/ri";

const UpdateBlog = () => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<FormApiRef>(null);

  const { session } = useAuth();
  const router = useRouter();

  const searchParams = useParams<{ id: string }>();
  const blogId = searchParams.id;

  const handleFetchBlog = useCallback(async () => {
    if (!blogId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await getManagementBlogApi(
        { id: blogId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setBlog(response.item);
      } else {
        showApiFailureToast(response, "Failed to load blog");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      Toaster("An error occurred while loading blog data", "error");
    } finally {
      setIsLoading(false);
    }
  }, [blogId, session?.tokens?.accessToken]);

  const handleSubmit = async (data: BlogFormValues) => {
    if (!blogId || !session?.tokens?.accessToken) return;

    try {
      setIsSubmitting(true);

      const response = await updateBlogApi(
        buildBlogFormData(data, { id: blogId }),
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        formRef,
        fieldMap: BLOG_FORM_FIELD_MAP,
        successMessage: "Blog updated successfully",
        errorTitle: "Failed to update blog",
        onSuccess: () => router.push("/blog-management"),
      });
    } catch (error) {
      console.error("Error updating blog:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to update blog",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useGatedPanelHeader(
    panelHeaderConfig.admin.blogManagement.update || {
      title: "Update Blog",
      description: "Edit blog details",
    },
    "blog",
  );

  useEffect(() => {
    handleFetchBlog();
  }, [handleFetchBlog, blogId]);

  if (isLoading && !blog) {
    return <BlogsFormLoader />;
  }

  if (!blog && !isLoading) {
    return (
      <NoDataFound
        message="Blog data not found"
        description="Please try again or contact support"
        icon={<RiBloggerLine className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      <div className="w-full flex flex-col items-start justify-start gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Update Blog
        </h1>
        <p className="text-sm text-400">
          Edit the details below to update {blog?.title}
        </p>
        <p className="text-xs text-500">
          Required fields are marked with{" "}
          <span className="text-red-400">*</span>
        </p>
      </div>

      {blog && (
        <div className="w-full bg-white sm:rounded-xl sm:border sm:border-200 sm:p-6">
          <BlogForm
            ref={formRef}
            initialData={blog}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Update Blog"
            isUpdate
          />
        </div>
      )}
    </div>
  );
};

export default UpdateBlog;
