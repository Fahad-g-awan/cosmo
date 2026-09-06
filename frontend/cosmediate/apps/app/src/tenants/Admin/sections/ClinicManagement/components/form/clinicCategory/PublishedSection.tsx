import { Label, Switch } from "@cosmediate/ui";
import { useFormValue, useFormSetValue } from "@cosmediate/form-core";

export const PublishedSection = () => {
  const published = useFormValue<boolean>("published");
  const setValue = useFormSetValue();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
      <div>
        <Label htmlFor="published" className="text-sm font-medium">
          Published
        </Label>
        <p className="text-xs text-gray-500 mt-1">
          Make this category visible to users
        </p>
      </div>
      <Switch
        id="published"
        checked={published ?? true}
        onCheckedChange={(checked) => setValue("published", checked)}
      />
    </div>
  );
};
