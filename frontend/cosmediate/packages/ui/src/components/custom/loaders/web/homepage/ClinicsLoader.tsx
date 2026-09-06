import { ClinicCardLoaderSimple } from "@cosmediate/ui";

export const ClinicsLoader = () => {
  return (
    <div className="w-full flex items-center justify-center gap-5">
      <div className="w-1/4">
        <ClinicCardLoaderSimple />
      </div>
      <div className="w-1/4 max-sm:hidden">
        <ClinicCardLoaderSimple />
      </div>
      <div className="w-1/4 max-sm:hidden">
        <ClinicCardLoaderSimple />
      </div>
      <div className="w-1/4 max-lg:hidden">
        <ClinicCardLoaderSimple />
      </div>
    </div>
  );
};
