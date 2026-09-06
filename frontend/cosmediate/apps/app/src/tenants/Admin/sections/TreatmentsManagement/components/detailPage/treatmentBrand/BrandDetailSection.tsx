import React from "react";

import { TreatmentBrand } from "@cosmediate/type-utils";

import { Check, Tag, X } from "lucide-react";
import { Badge } from "@cosmediate/ui/index";

export const BrandDetailSection = ({ brand }: { brand: TreatmentBrand }) => {
  return (
    <div className="w-full flex flex-col itemc-center justify-start gap-5">
      <div className="w-full flex items-center justify-start gap-2 pb-3 border-b border-stroke">
        <Tag className="h-5 w-5" />
        brand Details
      </div>

      <div className="w-full grid grid-cols-1 items-start justify-center gap-6">
        <div className="w-full flex flex-col items-start justify-start gap-2">
          <p className="text-sm text-muted-foreground mb-2">Status</p>
          <Badge
            variant={brand.published ? "default" : "secondary"}
            className={
              brand.published
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }
          >
            {brand.published ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {brand.published ? "Published" : "Unpublished"}
          </Badge>
        </div>
      </div>
    </div>
  );
};
