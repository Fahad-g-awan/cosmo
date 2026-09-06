import React from "react";

import { TreatmentCategory } from "@cosmediate/type-utils";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

export const HeaderSection = ({
  category,
  handleDelete,
  perms = [],
}: {
  category: TreatmentCategory;
  handleDelete: () => void;
  perms?: string[];
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full flex items-start justify-between max-sm:flex-col max-sm:items-start gap-5">
        <h1 className="text-2xl font-bold capitalize text-800">
          {category.name}
        </h1>

        <CrudProfileActions
          perms={perms}
          resource="treatment_category"
          editHref={`/treatments/categories/update/${category.id}`}
          onDelete={handleDelete}
          className="flex self-start items-start justify-end max-sm:justify-start max-sm:w-full gap-3"
        />
      </div>
    </div>
  );
};
