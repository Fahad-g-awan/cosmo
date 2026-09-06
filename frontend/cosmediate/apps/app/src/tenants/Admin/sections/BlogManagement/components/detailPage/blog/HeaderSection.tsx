import React from "react";

import { Blog } from "@cosmediate/type-utils";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

export const HeaderSection = ({
  blog,
  handleDelete,
  perms = [],
}: {
  blog: Blog;
  handleDelete: () => void;
  perms?: string[];
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full flex items-start justify-between max-sm:flex-col max-sm:items-start gap-5">
        <h1 className="text-2xl font-bold capitalize text-800">{blog.title}</h1>

        <CrudProfileActions
          perms={perms}
          resource="blog"
          editHref={`/blog-management/update/${blog.id}`}
          onDelete={handleDelete}
          className="flex self-start items-start justify-end max-sm:justify-start max-sm:w-full gap-3"
        />
      </div>

      <span className={"w-full text-sm text-700 leading-6"}>
        {blog.overview}
      </span>
    </div>
  );
};
