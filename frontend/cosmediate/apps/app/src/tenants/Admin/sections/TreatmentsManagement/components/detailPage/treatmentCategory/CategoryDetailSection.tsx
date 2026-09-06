import React from "react";

import { TreatmentCategory } from "@cosmediate/type-utils";

import { Check, Hash, Tag, X } from "lucide-react";
import { Badge } from "@cosmediate/ui/index";

export const CategoryDetailSection = ({
  category,
}: {
  category: TreatmentCategory;
}) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Tag className="h-5 w-5" />
        Category Details
      </div>

      <div className="w-full grid grid-cols-2 items-start justify-center gap-6">
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <p className="text-sm text-muted-foreground mb-2">Status</p>
          <Badge
            variant={category.published ? "default" : "secondary"}
            className={
              category.published
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {category.published ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {category.published ? "Published" : "Unpublished"}
          </Badge>
        </div>

        <div className="w-full flex flex-col items-start justify-start gap-2">
          <p className="text-sm text-muted-foreground mb-2">Treatment Count</p>
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-500" />
            <span className="text-lg font-semibold">
              {category.treatmentCount ?? 0}
            </span>
            <span className="text-sm text-muted-foreground">treatments</span>
          </div>
        </div>
      </div>
    </div>
  );
};
