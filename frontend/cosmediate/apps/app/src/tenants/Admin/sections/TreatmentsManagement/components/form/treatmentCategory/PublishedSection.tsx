import { ControlledSwitchField } from "@cosmediate/form-ui";

export const PublishedSection = () => {
  return (
    <div className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <ControlledSwitchField
        className="w-full max-lg:col-span-2"
        path="published"
        label="Published"
        required
        defaultChecked
        description="Make this category visible to users."
      />
    </div>
  );
};
