import React from "react";

import { Button, ButtonLoader } from "@cosmediate/ui";

interface SubTreatmentsFooterProps {
  handleUpsertSubTreatmentsAPI: () => Promise<boolean | void> | void;
  handleCancel: () => void;
  isLoading: boolean;
  canSave: boolean;
}

const SubTreatmentsFooter = ({
  handleUpsertSubTreatmentsAPI,
  handleCancel,
  isLoading,
  canSave,
}: SubTreatmentsFooterProps) => {
  return (
    <div className="w-full px-2 sm:px-3.75 flex items-stretch sm:items-center gap-2">
      <Button
        variant="outline"
        type="button"
        className="min-w-0 flex-1"
        onClick={() => handleCancel()}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="min-w-0 flex-1"
        onClick={handleUpsertSubTreatmentsAPI}
        disabled={isLoading || !canSave}
      >
        {isLoading ? <ButtonLoader /> : <span>Save</span>}
      </Button>
    </div>
  );
};

export default SubTreatmentsFooter;
