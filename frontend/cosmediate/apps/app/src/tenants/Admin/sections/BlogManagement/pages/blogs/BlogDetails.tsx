"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { BlogsDetailsLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { deleteBlogApi, getManagementBlogApi } from "@cosmediate/api";
import { cn } from "@cosmediate/ui/lib/utils";
import { Blog } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  handleDetailDeleteResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

import { AuthorInfoSection } from "@app/components/detail/AuthorInfoSection";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";

import { SystemInfoSection } from "../../components/detailPage/blog/SystemInfoSection";
import { BlogInfoSection } from "../../components/detailPage/blog/BlogInfoSection";
import { ContentSection } from "../../components/detailPage/blog/ContentSection";
import { HeaderSection } from "../../components/detailPage/blog/HeaderSection";
import { ImageSection } from "../../components/detailPage/blog/ImageSection";
import { TagsSection } from "../../components/detailPage/blog/TagsSection";

import { RiBloggerLine } from "react-icons/ri";

const BlogDetails = () => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const { perms } = usePermissions();
  const router = useRouter();

  const params = useParams<{ id: string }>();
  const blogId = params.id;

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

  const handleDelete = useCallback(() => {
    if (!blogId) {
      console.log("[Blogs_HandleDelete] Error blog id not provided");
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
            const resp = await deleteBlogApi(
              { id: blogId },
              session?.tokens?.accessToken as string,
            );

            await handleDetailDeleteResult(resp, {
              successMessage: "Blog deleted successfully",
              errorTitle: "Failed to delete blog",
              closeDialog,
              onSuccess: () => router.push("/blog-management"),
            });
          } catch (error) {
            console.log("[Blogs_HandleDelete] Error deleting blog:", error);
            await handleDetailDeleteResult(
              {
                success: false,
                message:
                  error instanceof Error ? error.message : undefined,
              },
              {
                successMessage: "Blog deleted successfully",
                errorTitle: "Failed to delete blog",
                closeDialog,
                onSuccess: () => router.push("/blog-management"),
              },
            );
          }
        },
      },
    });
  }, [closeDialog, openDialog, session?.tokens?.accessToken, blogId, router]);

  useGatedPanelHeader(panelHeaderConfig.admin.blogManagement.record, "blog");

  useEffect(() => {
    handleFetchBlog();
  }, [handleFetchBlog]);

  if (isLoading && !blog) {
    return <BlogsDetailsLoader />;
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
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {blog && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection
            blog={blog}
            handleDelete={handleDelete}
            perms={perms}
          />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-3 max-xl:grid-cols-1 gap-6">
              <div className="w-full col-span-1">
                <div className="w-full xl:sticky xl:top-6 space-y-6">
                  <ImageSection
                    image={blog?.image || "/placeholder.jpg"}
                    title={blog.title}
                  />
                  <BlogInfoSection blog={blog} />
                  <TagsSection tags={blog?.tags || []} />
                </div>
              </div>

              <div className="xl:col-span-2 w-full space-y-6">
                <ContentSection blog={blog} />
                <AuthorInfoSection
                  authorName={blog.authorName}
                  authorEmail={blog.authorEmail}
                  authorId={blog.authorId}
                />
                <SystemInfoSection blog={blog} />
              </div>
            </div>
          </div>
        </div>
      )}
      <DialogRenderer />
    </div>
  );
};

export default BlogDetails;
