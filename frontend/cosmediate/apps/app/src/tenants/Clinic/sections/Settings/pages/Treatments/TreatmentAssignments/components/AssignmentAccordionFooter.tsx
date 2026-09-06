import { Button, ButtonLoader } from "@cosmediate/ui";

interface AssignmentAccordionFooterProps {
  onSave: () => void | Promise<void> | Promise<boolean | void>;
  onCancel: () => void;
  isLoading: boolean;
  canSave: boolean;
}

export const AssignmentAccordionFooter = ({
  onSave,
  onCancel,
  isLoading,
  canSave,
}: AssignmentAccordionFooterProps) => {
  return (
    <div className="w-full px-2 sm:px-3.75 flex items-stretch sm:items-center gap-2">
      <Button
        variant="outline"
        type="button"
        className="min-w-0 flex-1"
        onClick={onCancel}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        className="min-w-0 flex-1"
        onClick={onSave}
        disabled={isLoading || !canSave}
      >
        {isLoading ? <ButtonLoader /> : <span>Save</span>}
      </Button>
    </div>
  );
};
