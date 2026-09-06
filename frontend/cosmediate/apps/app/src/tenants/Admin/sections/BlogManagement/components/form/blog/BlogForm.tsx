import { forwardRef, useMemo } from "react";

import { createFormStore, FormProvider } from "@cosmediate/form-core";

import { useFormApiHandle, type FormApiRef } from "@app/lib/form-api-ref";

import { BlogFormProps, BlogFormValues } from "../../../types/blog.types";
import { defaultBlogFormValues } from "../../../defaults/blogs.defaults";
import { BlogFormSchema } from "../../../schemas/blogForm.schema";
import { BlogFormInner } from "./BlogFormInner";

export const BlogForm = forwardRef<FormApiRef, BlogFormProps>(function BlogForm(
  { initialData, onSubmit, isSubmitting = false, submitLabel, isUpdate },
  ref,
) {
  const store = useMemo(
    () =>
      createFormStore({
        initialValues: {
          ...defaultBlogFormValues,
          ...initialData,
          blogImage: initialData?.image || undefined,
          title: initialData?.title ?? "",
          categoryId: initialData?.categoryId ?? "",
          status: initialData?.status ?? undefined,
          overview: initialData?.overview ?? "",
          tags: initialData?.tags ?? [],
          content:
            initialData?.content ?? defaultBlogFormValues.content,
          publishedAt: initialData?.publishedAt
            ? typeof initialData.publishedAt === "string"
              ? initialData.publishedAt
              : new Date(initialData.publishedAt).toISOString().slice(0, 16)
            : "",
        } as BlogFormValues,
        schema: BlogFormSchema,
      }),
    [initialData],
  );

  useFormApiHandle(store, ref);

  return (
    <FormProvider store={store}>
      <BlogFormInner
        initialData={initialData}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={submitLabel}
        isUpdate={isUpdate}
      />
    </FormProvider>
  );
});
