import React from "react";

import { BlogCategory } from "@cosmediate/type-utils";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

export const HeaderSection = ({
  blogCategory,
  handleDelete,
  perms = [],
}: {
  blogCategory: BlogCategory;
  handleDelete: () => void;
  perms?: string[];
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full flex items-start justify-between max-sm:flex-col max-sm:items-start gap-5">
        <h1 className="text-2xl font-bold capitalize text-800">
          {blogCategory.name}
        </h1>

        <CrudProfileActions
          perms={perms}
          resource="blog_category"
          editHref={`/blogCategory-management/update/${blogCategory.id}`}
          onDelete={handleDelete}
          className="flex self-start items-start justify-end max-sm:justify-start max-sm:w-full gap-3"
        />
      </div>
    </div>
  );
};
