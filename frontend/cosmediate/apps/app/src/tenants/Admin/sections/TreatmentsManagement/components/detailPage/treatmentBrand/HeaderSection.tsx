import React from "react";

import { TreatmentBrand } from "@cosmediate/type-utils";

import { CrudProfileActions } from "@app/components/profile/CrudProfileActions";

export const HeaderSection = ({
  brand,
  handleDelete,
  perms = [],
}: {
  brand: TreatmentBrand;
  handleDelete: () => void;
  perms?: string[];
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5 bg-gradient-lite-violet px-6 py-8">
      <div className="w-full flex items-start justify-between max-sm:flex-col max-sm:items-start gap-5">
        <h1 className="text-2xl font-bold capitalize text-800">
          {brand.name}
        </h1>

        <CrudProfileActions
          perms={perms}
          resource="treatment_brand"
          editHref={`/treatments/brands/update/${brand.id}`}
          onDelete={handleDelete}
          className="flex self-start items-start justify-end max-sm:justify-start max-sm:w-full gap-3"
        />
      </div>
    </div>
  );
};
