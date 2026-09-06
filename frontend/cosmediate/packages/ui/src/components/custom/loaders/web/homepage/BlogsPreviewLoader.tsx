import { BlogCardLoader } from "@cosmediate/ui";

export const BlogsPreviewLoader = () => {
  return (
    <div className="w-full grid grid-cols-3 max-sm:grid-cols-1 items-center justify-start gap-2">
      <BlogCardLoader />
      <BlogCardLoader className="max-sm:hidden" />
      <BlogCardLoader className="max-sm:hidden" />
    </div>
  );
};
