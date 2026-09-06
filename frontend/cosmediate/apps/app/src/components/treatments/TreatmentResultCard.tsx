import Image from "next/image";
import React from "react";

import { TreatmentResult } from "@cosmediate/type-utils";

import ActionMenu from "@app/components/ActionMenu";
import { canCrud } from "@app/lib/permissions";

import { Trash2, Pencil } from "lucide-react";

interface TreatmentResultCardProps {
  result: TreatmentResult;
  readOnly?: boolean;
  handleDelete?: (id: string) => void;
  handleEdit?: (id: string) => void;
  perms?: string[];
}

const TreatmentResultCard: React.FC<TreatmentResultCardProps> = ({
  result,
  readOnly = false,
  handleDelete,
  handleEdit,
  perms = [],
}) => {
  const canEdit =
    !readOnly && canCrud(perms, "treatment_result", "update");
  const canDelete =
    !readOnly && canCrud(perms, "treatment_result", "delete");
  const showMenu = canEdit || canDelete;

  const menuItems = [
    ...(canEdit
      ? [
          {
            label: "Edit",
            icon: <Pencil className="size-4" />,
            onClick: () => handleEdit?.(result.id),
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: "Delete",
            icon: <Trash2 className="size-4" />,
            destructive: true,
            onClick: () => handleDelete?.(result.id),
          },
        ]
      : []),
  ];
  return (
    <div className="w-full relative bg-primary-accent/5 h-[270px] rounded-2xl overflow-hidden flex flex-col items-center justify-start gap-3">
      <div className="w-full flex rounded-none">
        <div className="w-[50%] h-[170px] aspect-square relative rounded-none">
          <Image
            src={result.beforeImage || "/placeholder.jpg"}
            alt={result?.treatmentName || "Treatment before image"}
            height={500}
            width={500}
            className="w-full h-full object-cover rounded-none"
          />
        </div>

        <div className="w-[50%] h-[170px] aspect-square relative rounded-none">
          <Image
            src={result.afterImage || "/placeholder.jpg"}
            alt={result?.treatmentName || "Treatment after image"}
            height={500}
            width={500}
            className="w-full h-full object-cover rounded-none"
          />
        </div>
      </div>

      <div className="w-full space-y-1 p-3">
        <h3 className="font-semibold capitalize text-600 text-sm text-left line-clamp-1">
          {result?.treatmentName || "Unknown Treatment"}
        </h3>

        <p className="text-sm text-left text-400 line-clamp-2">
          {result?.description || "No description available"}
        </p>
      </div>

      {showMenu && menuItems.length > 0 && (
        <div className="absolute top-3 right-3">
          <ActionMenu items={menuItems} className="min-w-[150px]" />
        </div>
      )}
    </div>
  );
};

export default TreatmentResultCard;
